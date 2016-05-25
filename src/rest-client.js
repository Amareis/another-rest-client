import Events from 'minivents'

function encodeUrl(data) {
    let res = '';
    for (let k in data)
        res += encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) + '&';
    return res.substr(0, res.length - 1);
}

class RestClient {
    constructor(host, options) {
        this.host = host;
        this.conf(options);

        new Events(this);

        resource(this, undefined, '', undefined, this);
    }

    conf(options={}) {
        this._opts = this._opts || {
            trailing: '',
            shortcut: true,
            contentType: 'application/json',
            'application/x-www-form-urlencoded': {encode: encodeUrl},
            'application/json': {encode: JSON.stringify, decode: JSON.parse}
        };

        for (let k in this._opts) {
            if (k in options)
                this._opts[k] = options[k];
        }
    }

    _request(method, url, data=null, contentType=null) {
        if (url.indexOf('?') == -1)
            url += this._opts.trailing;
        else
            url = url.replace('?', this._opts.trailing + '?');

        let xhr = new XMLHttpRequest();
        xhr.open(method, this.host + url, true);

        if (contentType) {
            let mime = this._opts[contentType];
            if (mime && mime.encode)
                data = mime.encode(data);
            xhr.setRequestHeader('Content-Type', contentType);
        }

        this.emit('request', xhr);

        let p = new Promise((resolve, reject) => {
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    this.emit('answer', xhr);
                    if (xhr.status == 200 || xhr.status == 201 || xhr.status == 204) {
                        this.emit('success', xhr);

                        let responseContentType = xhr.getResponseHeader('Content-Type');
                        let mime = this._opts[responseContentType];
                        let res = xhr.responseText;
                        if (mime && mime.decode)
                            res = mime.decode(res);

                        resolve(res);
                    } else {
                        this.emit('error', xhr);
                        reject(xhr);
                    }
                }
            };
        });
        xhr.send(data);
        return p;
    }
}

function resource(client, parent, name, id, ctx) {
    let self = ctx ? ctx : (newId) => {
        if (newId == undefined)
            return self;

        let copy = resource(client, parent, name, newId);
        copy._shortcuts = self._shortcuts;
        for (let resName in self._resources) {
            let original = self._resources[resName];
            let derived = resource(client, copy, resName);
            derived._resources = original._resources;
            derived._shortcuts = original._shortcuts;

            copy._resources[resName] = derived;
            if (resName in self._shortcuts)
                copy[resName] = derived;
        }
        return copy;
    };

    self._resources = {};
    self._shortcuts = {};

    self.res = (resources, shortcut=client._opts.shortcut) => {
        let makeRes = (resName) => {
            if (resName in self._resources)
                return self._resources[resName];

            let r = resource(client, self, resName);
            self._resources[resName] = r;
            if (shortcut) {
                self._shortcuts[resName] = r;
                self[resName] = r;
            }
            return r;
        };

        // (resources instanceof String) don't work. Fuck you, javascript.
        if (resources.constructor == String)
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
        if (id != undefined)
            url += '/' + id;
        return url;
    };

    if (id == undefined) {
        self.add = (data, contentType = client._opts.contentType) => {
            return client._request('POST', self.url(), data, contentType);
        };

        self.get = (args) => {
            let url = self.url();
            if (args)
                url += '?' + encodeUrl(args);
            return client._request('GET', url);
        };
    } else {
        self.get = () => {
            return client._request('GET', self.url());
        };

        self.upd = (data, contentType = client._opts.contentType) => {
            return client._request('PUT', self.url(), data, contentType);
        };

        self.del = () => {
            return client._request('DELETE', self.url());
        };
    }
    return self;
}

module.exports = RestClient;
