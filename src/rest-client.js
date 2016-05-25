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
        this._resources = {};

        this.conf(options);
        new Events(this);

        resource(this, '', '', this);
    }

    conf(options={}) {
        this._opts = this._opts || {
            trailing: '',
            shortcut: true,
            contentType: 'application/json',
            encoders: {
                'application/x-www-form-urlencoded': encodeUrl,
                'application/json': JSON.stringify
            },
            decoders: {
                'application/json': JSON.parse
            }
        };

        for (let k in this._opts) {
            if (k in options)
                this._opts[k] = options[k];
        }
    }

    _request(method, url, data=null, contentType=null) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, this.host + url, true);

        if (contentType) {
            let encoder = this._opts.encoders[contentType];
            if (encoder)
                data = encoder(data);
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
                        let decoder = this._opts.decoders[responseContentType];
                        let res = xhr.responseText;
                        if (decoder)
                            res = decoder(res);

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

function resource(client, name, baseUrl, ctx) {
    let self = ctx ? ctx : (id) => {
        let res = {};
        for (let resName in self._resources) {
            let r = resource(client, resName, self.url(id, false));
            r._resources = self._resources[resName]._resources;
            res[resName] = r;

            r.get = () => {
                let url = '';
                if (!id || id instanceof Object) {
                    url = self.url();
                    if (id)
                        url += '?' + encodeUrl(id);
                } else {
                    url = self.url(id);
                }
                return client._request('GET', url);
            };

            r.upd = (data, contentType=client._opts.contentType) => {
                return client._request('PUT', self.url(id), data, contentType);
            };

            r.del = () => {
                return client._request('DELETE', self.url(id));
            };
        }
        return res;
    };

    self._resources = {};

    self.res = (resourceName, shortcut=client._opts.shortcut) => {
        let resourceArray = [].concat(resourceName);
        let results = [];
        for (let resName of resourceArray) {
            let r = self._resources[resName] || resource(client, resName, self.url(undefined, false));
            self._resources[resName] = r;
            if (shortcut)
                self[resName] = r;
            results.push(r);
        }
        if (resourceName instanceof Array)
            return results;
        return results[0];
    };

    self.url = (id, final=true) => {
        let url = baseUrl;
        if (name)
            url += '/' + name;
        if (id !== undefined)
            url += '/' + id;
        if (final)
            url += client._opts.trailing;
        return url;
    };

    self.add = (data, contentType=client._opts.contentType) => {
        return client._request('POST', self.url(), data, contentType);
    };
    return self;
}

module.exports = RestClient;
