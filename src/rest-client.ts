import {Events, Target} from './minivents.js'

function entries<T extends Record<string, any>>(obj: T): ([Extract<keyof T, string>, any])[] {
    return Object.entries(obj) as any
}

type Arg = Record<string, string | boolean | number>

function encodeUrl(data: Arg) {
    let res = ''
    for (let [k, v] of entries(data))
        res += encodeURIComponent(k) + '=' + encodeURIComponent(v) + '&'
    return res.slice(0, res.length - 1)
}

function safe(func: Function, data: any) {
    try {
        return func(data)
    }
    catch(e) {
        console.error('Error in function "' + func.name + '" while decode/encode data')
        console.log(func)
        console.log(data)
        console.log(e)
        return data
    }
}

export type CustomShortcut = (resName: string) => string

export type Encodings = {
    [mime: string]: {
        encode?: (data: any) => string
        decode?: (xhrResponse: string) => any
    }
}

export type Opts = {
    trailing: string
    shortcut: boolean
    shortcutRules: CustomShortcut[]
    contentType: string
    encodings: Encodings
}

type Ress = string | readonly string[] | { [resName: string]: Ress | 0 | null | undefined}

type MakeRes<T extends Ress> =
    T extends string ? {[resName in T]: Res}
        : T extends ReadonlyArray<infer S> ? Res & ([S] extends [string] ? {[resName in S]: Res} : never)
            : {[ResName in keyof T]: T[ResName] extends Ress ? Res & MakeRes<T[ResName]> : Res}

type MR<T extends Ress> =
    T extends string ? Res
        : T extends string[] ? Res[]
            : {[ResName in keyof T]: T[ResName] extends Ress ? Res & MR<T[ResName]> : Res}

class Res extends Function {
    private _shortcuts: Record<string, Res> = {}
    private _resources: Record<string, Res> = {}

    private get _client() {
        return this._c()
    }

    constructor(private _c: () => RestClient, private _parent: Res | undefined, private _name: string, private _id?: string) {
        super('id', 'return arguments.callee.__call(id)')
    }

    private __call = (newId?: string) => {
        if (newId === undefined)
            return this
        return this._clone(this._parent, newId)
    }

    private _clone = (parent: Res | undefined, newId?: string) => {
        let copy = new Res(this._c, parent, this._name, newId)
        copy._shortcuts = this._shortcuts
        for (let resName in this._resources) {
            copy._resources[resName] = this._resources[resName]._clone(copy)

            if (resName in copy._shortcuts)
                (copy as any)[resName] = copy._resources[resName]
        }
        return copy
    }

    withRes = <T extends Ress>(resources: T, shortcut=this._client._opts.shortcut): this & MakeRes<T> => {
        this.res(resources, shortcut)
        return this as any
    }

    res = <T extends Ress>(resources: T, shortcut=this._client._opts.shortcut): MR<T> => {
        let makeRes = (resName: string) => {
            if (resName in this._resources)
                return this._resources[resName]

            let r = new Res(this._c, this, resName)
            this._resources[resName] = r
            if (shortcut) {
                const self = this as any as MakeRes<T>
                this._shortcuts[resName] = r
                self[resName] = r
                for (const rule of this._client._opts.shortcutRules) {
                    const customShortcut = rule(resName)
                    if (customShortcut && typeof customShortcut === 'string') {
                        this._shortcuts[customShortcut] = r
                        self[customShortcut] = r
                    }
                }
            }
            return r
        }

        // (resources instanceof String) don't work in js.
        if (typeof resources === 'string')
            return makeRes(resources) as any

        if (resources instanceof Array)
            return resources.map(makeRes) as any

        if (resources instanceof Object) {
            let resObj: Record<string, Res> = {}
            for (let resName in resources) {
                let r = makeRes(resName)
                const nr = resources[resName]
                if (nr) {
                    r.res(nr as any)
                }
                resObj[resName] = r
            }
            return resObj as any
        }

        throw new TypeError('Wrong "resources" argument! Should be string, array of strings or object')
    }

    url = (): string => {
        let url = this._parent?.url() ?? ''
        if (this._name)
            url += '/' + this._name
        if (this._id !== undefined)
            url += '/' + this._id
        return url
    }

    get = (...args: Arg[]) => {
        let url = this.url()
        const query = args.map(encodeUrl).join('&')
        if (query)
            url += '?' + query
        return this._client._request('GET', url)
    }

    post = (data: any, contentType = this._client._opts.contentType) => {
        return this._client._request('POST', this.url(), data, contentType)
    }

    put = (data: any, contentType = this._client._opts.contentType) => {
        return this._client._request('PUT', this.url(), data, contentType)
    }

    patch = (data: any, contentType = this._client._opts.contentType) => {
        return this._client._request('PATCH', this.url(), data, contentType)
    }

    delete = () => {
        return this._client._request('DELETE', this.url())
    }
}

export class RestClient extends Res implements Target {
    host: string

    _opts: Opts = {
        trailing: '',
        shortcut: true,
        shortcutRules: [],
        contentType: 'application/json',
        encodings: {
            'application/x-www-form-urlencoded': {encode: encodeUrl},
            'application/json': {encode: JSON.stringify, decode: JSON.parse},
        }
    }

    emit!: Target['emit']
    on!: Target['on']
    off!: Target['off']

    constructor(host: string, options?: Partial<Opts> & Encodings) {
        super(() => this, undefined, '', undefined)
        Events(this)

        this.host = host
        this.conf(options)
    }

    conf(options: Partial<Opts> = {}): Opts {
        for (const [k, v] of entries(options)) {
            if (k === 'encodings') {
                Object.assign(this._opts.encodings, v)
                continue
            }

            if (k in this._opts) {
                (this._opts as any)[k] = v
            } else {
                this._opts.encodings[k] = v
                console.warn(`There is no option '${k}' in another-rest-client options. Probably this is encoding and should be in 'encodings' option!`)
            }
        }

        return {
            ...this._opts,
            encodings: {...this._opts.encodings},
            shortcutRules: [...this._opts.shortcutRules],
        }
    }

    _request(method: string, url: string, data: any = null, contentType: string | null = null) {
        if (url.indexOf('?') === -1)
            url += this._opts.trailing
        else
            url = url.replace('?', this._opts.trailing + '?')

        let xhr = new XMLHttpRequest()
        xhr.open(method, this.host + url, true)

        if (contentType) {
            let mime = this._opts.encodings[contentType]
            if (mime && mime.encode)
                data = safe(mime.encode, data)
            if (!(contentType === 'multipart/form-data' && data instanceof FormData))
                xhr.setRequestHeader('Content-Type', contentType)
        }

        let p = Events(new Promise((resolve, reject) =>
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    this.emit('response', xhr)
                    p.emit('response', xhr)
                    if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
                        this.emit('success', xhr)
                        p.emit('success', xhr)

                        let res = xhr.response
                        let responseHeader = xhr.getResponseHeader('Content-Type')
                        if (responseHeader) {
                            let responseContentType = responseHeader.split(';')[0]
                            let mime = this._opts.encodings[responseContentType]
                            if (mime && mime.decode)
                                res = safe(mime.decode, res)
                        }
                        p.off()
                        resolve(res)
                    } else {
                        this.emit('error', xhr)
                        p.emit('error', xhr)
                        p.off()
                        reject(xhr)
                    }
                }
            }
        ))
        Promise.resolve().then(() => {
            this.emit('request', xhr)
            p.emit('request', xhr)
            xhr.send(data)
        })
        return p
    }
}

export default RestClient

