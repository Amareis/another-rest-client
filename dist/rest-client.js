var RestClient = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __reExport = (target, module, copyDefault, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toESM = (module, isNodeMode) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", !isNodeMode && module && module.__esModule ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // node_modules/minivents/dist/minivents.commonjs.min.js
  var require_minivents_commonjs_min = __commonJS({
    "node_modules/minivents/dist/minivents.commonjs.min.js"(exports, module) {
      module.exports = function(n) {
        var t = {}, e = [];
        n = n || this, n.on = function(e2, r, l) {
          return (t[e2] = t[e2] || []).push([r, l]), n;
        }, n.off = function(r, l) {
          r || (t = {});
          for (var o = t[r] || e, u = o.length = l ? o.length : 0; u--; )
            l == o[u][0] && o.splice(u, 1);
          return n;
        }, n.emit = function(r) {
          for (var l, o = t[r] || e, u = o.length > 0 ? o.slice(0, o.length) : o, i = 0; l = u[i++]; )
            l[0].apply(l[1], e.slice.call(arguments, 1));
          return n;
        };
      };
    }
  });

  // src/rest-client.js
  var require_rest_client = __commonJS({
    "src/rest-client.js"(exports, module) {
      var import_minivents = __toESM(require_minivents_commonjs_min());
      function encodeUrl(data) {
        let res = "";
        for (let k in data)
          res += encodeURIComponent(k) + "=" + encodeURIComponent(data[k]) + "&";
        return res.substr(0, res.length - 1);
      }
      function safe(func, data) {
        try {
          return func(data);
        } catch (e) {
          console.error('Error in function "' + func.name + '" while decode/encode data');
          console.log(func);
          console.log(data);
          console.log(e);
          return data;
        }
      }
      var RestClient = class {
        constructor(host, options) {
          this.host = host;
          this.conf(options);
          new import_minivents.default(this);
          resource(this, void 0, "", void 0, this);
        }
        conf(options = {}) {
          let currentOptions = this._opts || {
            trailing: "",
            shortcut: true,
            shortcutRules: [],
            contentType: "application/json",
            "application/x-www-form-urlencoded": { encode: encodeUrl },
            "application/json": { encode: JSON.stringify, decode: JSON.parse }
          };
          this._opts = Object.assign(currentOptions, options);
          return Object.assign({}, this._opts);
        }
        _request(method, url, data = null, contentType = null) {
          if (url.indexOf("?") === -1)
            url += this._opts.trailing;
          else
            url = url.replace("?", this._opts.trailing + "?");
          let xhr = new XMLHttpRequest();
          xhr.open(method, this.host + url, true);
          if (contentType) {
            let mime = this._opts[contentType];
            if (mime && mime.encode)
              data = safe(mime.encode, data);
            if (!(contentType === "multipart/form-data" && data.constructor.name === "FormData"))
              xhr.setRequestHeader("Content-Type", contentType);
          }
          let p = new Promise((resolve, reject) => xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
              this.emit("response", xhr);
              p.emit("response", xhr);
              if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
                this.emit("success", xhr);
                p.emit("success", xhr);
                let res = xhr.response;
                let responseHeader = xhr.getResponseHeader("Content-Type");
                if (responseHeader) {
                  let responseContentType = responseHeader.split(";")[0];
                  let mime = this._opts[responseContentType];
                  if (mime && mime.decode)
                    res = safe(mime.decode, res);
                }
                p.off();
                resolve(res);
              } else {
                this.emit("error", xhr);
                p.emit("error", xhr);
                p.off();
                reject(xhr);
              }
            }
          });
          new import_minivents.default(p);
          Promise.resolve().then(() => {
            this.emit("request", xhr);
            p.emit("request", xhr);
            xhr.send(data);
          });
          return p;
        }
      };
      function resource(client, parent, name, id, ctx) {
        let self = ctx ? ctx : (newId) => {
          if (newId === void 0)
            return self;
          return self._clone(parent, newId);
        };
        self._resources = {};
        self._shortcuts = {};
        self._clone = (parent2, newId) => {
          let copy = resource(client, parent2, name, newId);
          copy._shortcuts = self._shortcuts;
          for (let resName in self._resources) {
            copy._resources[resName] = self._resources[resName]._clone(copy);
            if (resName in copy._shortcuts)
              copy[resName] = copy._resources[resName];
          }
          return copy;
        };
        self.res = (resources, shortcut = client._opts.shortcut) => {
          let makeRes = (resName) => {
            if (resName in self._resources)
              return self._resources[resName];
            let r = resource(client, self, resName);
            self._resources[resName] = r;
            if (shortcut) {
              self._shortcuts[resName] = r;
              self[resName] = r;
              client._opts.shortcutRules.forEach((rule) => {
                let customShortcut = rule(resName);
                if (customShortcut && typeof customShortcut === "string") {
                  self._shortcuts[customShortcut] = r;
                  self[customShortcut] = r;
                }
              });
            }
            return r;
          };
          if (resources.constructor === String)
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
          let url = parent ? parent.url() : "";
          if (name)
            url += "/" + name;
          if (id !== void 0)
            url += "/" + id;
          return url;
        };
        self.get = (...args) => {
          let url = self.url();
          const query = args.map(encodeUrl).join("&");
          if (query)
            url += "?" + query;
          return client._request("GET", url);
        };
        self.post = (data, contentType = client._opts.contentType) => {
          return client._request("POST", self.url(), data, contentType);
        };
        self.put = (data, contentType = client._opts.contentType) => {
          return client._request("PUT", self.url(), data, contentType);
        };
        self.patch = (data, contentType = client._opts.contentType) => {
          return client._request("PATCH", self.url(), data, contentType);
        };
        self.delete = () => {
          return client._request("DELETE", self.url());
        };
        return self;
      }
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      module.exports = RestClient;
    }
  });
  return require_rest_client();
})();
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RestClient = factory();
  }
}(typeof self !== 'undefined' ? self : this, () => RestClient));
//# sourceMappingURL=rest-client.js.map
