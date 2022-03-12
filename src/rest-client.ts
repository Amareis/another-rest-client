import {Events, Target} from './minivents.js'

function entries<T extends Record<string, any>>(obj: T): ([Extract<keyof T, string>, any])[] {
    return Object.entries(obj) as any
}

function encodeUrl(data: Record<string, string | boolean | number>) {
    let res = '';
    for (let [k, v] of entries(data))
        res += encodeURIComponent(k) + '=' + encodeURIComponent(v) + '&';
    return res.slice(0, res.length - 1);
}

function safe(func: Function, data: any) {
    try {
        return func(data);
    }
    catch(e) {
        console.error('Error in function "' + func.name + '" while decode/encode data');
        console.log(func);
        console.log(data);
        console.log(e);
        return data;
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

export class RestClient implements Target, Res {
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

    constructor(host: string, options: Partial<Opts> & Encodings) {
        this.host = host;
        this.conf(options);

        Events(this);

        // resource must be super class of RestClient
        // but js cannot into callable objects, so...
        // After this call all resource methods will be defined
        // on current RestClient instance (this behaviour affected by last parameter)
        // At least parameters are symmetric :D
        resource(this, undefined, '', undefined, this);
    }

    conf(options: Partial<Opts> = {}): Opts {
        for (const [k, v] of entries(options)) {
            if (k === 'encodings') {
                Object.assign(this._opts.encodings, v)
                continue
            }

            if (k in this._opts)
                (this._opts as any)[k] = v
            else {
                this._opts.encodings[k] = v
                console.warn(`There is no option '${k}' in another-rest-client options. Probably this is encoding and should be in 'encodings' option!`)
            }
        }

        return {
            ...this._opts,
            encodings: {...this._opts.encodings},
            shortcutRules: [...this._opts.shortcutRules],
        };
    }

    _request(method: string, url: string, data: any = null, contentType: string | null = null) {
        if (url.indexOf('?') === -1)
            url += this._opts.trailing;
        else
            url = url.replace('?', this._opts.trailing + '?');

        let xhr = new XMLHttpRequest();
        xhr.open(method, this.host + url, true);

        if (contentType) {
            let mime = this._opts.encodings[contentType];
            if (mime && mime.encode)
                data = safe(mime.encode, data);
            if (!(contentType === 'multipart/form-data' && data instanceof FormData))
                xhr.setRequestHeader('Content-Type', contentType);
        }

        let p = Events(new Promise((resolve, reject) =>
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    this.emit('response', xhr);
                    p.emit('response', xhr);
                    if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
                        this.emit('success', xhr);
                        p.emit('success', xhr);

                        let res = xhr.response;
                        let responseHeader = xhr.getResponseHeader('Content-Type');
                        if (responseHeader) {
                            let responseContentType = responseHeader.split(';')[0];
                            let mime = this._opts.encodings[responseContentType];
                            if (mime && mime.decode)
                                res = safe(mime.decode, res);
                        }
                        p.off();
                        resolve(res);
                    } else {
                        this.emit('error', xhr);
                        p.emit('error', xhr);
                        p.off();
                        reject(xhr);
                    }
                }
            }
        ))
        Promise.resolve().then(() => {
            this.emit('request', xhr);
            p.emit('request', xhr);
            xhr.send(data);
        });
        return p;
    }
}

interface Res {
    _shortcuts: Record<string, Res>
    _resources: Record<string, Res>
}

function resource(client: RestClient, parent: Res | undefined, name: string, id: string | undefined, ctx?: Res): Res {
    let self: Res = ctx ? ctx : (newId?: string) => {
        if (newId === undefined)
            return self;
        return self._clone(parent, newId);
    };

    self._resources = {};
    self._shortcuts = {};

    self._clone = (parent: Res, newId: string) => {
        let copy = resource(client, parent, name, newId);
        copy._shortcuts = self._shortcuts;
        for (let resName in self._resources) {
            copy._resources[resName] = self._resources[resName]._clone(copy);

            if (resName in copy._shortcuts)
                copy[resName] = copy._resources[resName];
        }
        return copy;
    };

    self.res = (resources, shortcut=client._opts.shortcut) => {
        let makeRes = (resName: string) => {
            if (resName in self._resources)
                return self._resources[resName];

            let r = resource(client, self, resName);
            self._resources[resName] = r;
            if (shortcut) {
                self._shortcuts[resName] = r;
                self[resName] = r;
                for (const rule of client._opts.shortcutRules) {
                    let customShortcut = rule(resName);
                    if (customShortcut && typeof customShortcut === 'string') {
                        self._shortcuts[customShortcut] = r;
                        self[customShortcut] = r;
                    }
                }
            }
            return r;
        };

        // (resources instanceof String) don't work in js.
        if (typeof resources === 'string')
            return makeRes(resources);

        if (resources instanceof Array)
            return resources.map(makeRes);

        if (resources instanceof Object) {
            let res = {};
            for (let resName in resources) {
                let r = makeRes(resName);
                if (resources[resName])
                    r.res(resources[resName]);
                res[resName] = r;
            }
            return res;
        }
    };

    self.url = () => {
        let url = parent ? parent.url() : '';
        if (name)
            url += '/' + name;
        if (id !== undefined)
            url += '/' + id;
        return url;
    };

    self.get = (...args) => {
        let url = self.url();
        const query = args.map(encodeUrl).join('&')
        if (query)
            url += '?' + query;
        return client._request('GET', url);
    };

    self.post = (data, contentType = client._opts.contentType) => {
        return client._request('POST', self.url(), data, contentType);
    };

    self.put = (data, contentType = client._opts.contentType) => {
        return client._request('PUT', self.url(), data, contentType);
    };

    self.patch = (data, contentType = client._opts.contentType) => {
        return client._request('PATCH', self.url(), data, contentType);
    };

    self.delete = () => {
        return client._request('DELETE', self.url());
    };

    return self;
}

export default RestClient

