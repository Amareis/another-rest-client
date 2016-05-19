class RestClient {
    constructor(host, trailing='/') {
        this._host = host;
        this._trailing = trailing;
    }

    res(res, shortcut=true) {
        let r = new RestResource(this, res);
        if (shortcut)
            this[res] = r;
        return r;
    }

    prerequest(request) {}

    _request(method, url, data, args) {
        function toQuery(dict, encode=true) {
            let res = '';
            let encodeFunc = t => t;
            if (encode)
                encodeFunc = encodeURIComponent;
            for (let k in dict) {
                //noinspection JSUnfilteredForInLoop
                res += `${encodeFunc(k)}=${encodeFunc(dict[k])}&`;
            }
            return res.substr(0, res.length - 1);
        }

        url = this._host + url + this._trailing;

        if (args)
            url += '?' + toQuery(args);

        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        let contentType = 'application/json';
        if (method == 'POST')
            contentType = 'application/x-www-form-urlencoded';
        xhr.setRequestHeader('Content-Type', contentType);

        this.prerequest(xhr);

        let p = new Promise((resolve, reject) => {
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200 || xhr.status == 201 || xhr.status == 204) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(xhr);
                    }
                }
            };
        });
        xhr.send(toQuery(data, false));
        return p;
    }
}

class RestResource {
    constructor(client, res) {
        this.client = client;
        this.res = res;
    }

    add(data) {
        return this.client._request('POST',   `/${this.res}`,      data, null);
    }

    all(args) {
        return this.client._request('GET',    `/${this.res}`,      null, args);
    }

    one(id) {
        return this.client._request('GET',    `/${this.res}/${id}`, null, null);
    }

    upd(id, data) {
        return this.client._request('PUT',    `/${this.res}/${id}`, data, null);
    }

    del(id) {
        return this.client._request('DELETE', `/${this.res}/${id}`, null, null);
    }
}

module.exports = RestClient;