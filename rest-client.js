(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["RestClient"] = factory();
	else
		root["RestClient"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _minivents = __webpack_require__(1);
	
	var _minivents2 = _interopRequireDefault(_minivents);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function encodeUrl(data) {
	    var res = '';
	    for (var k in data) {
	        res += encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) + '&';
	    }return res.substr(0, res.length - 1);
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
	
	var RestClient = function () {
	    function RestClient(host, options) {
	        _classCallCheck(this, RestClient);
	
	        this.host = host;
	        this.conf(options);
	
	        new _minivents2.default(this);
	
	        // resource must be super class of RestClient
	        // but fucking js cannot into callable objects, so...
	        // After this call all resource methods will be defined
	        // on current RestClient instance (this behaviour affected by last parameter)
	        // At least this parameters are symmetric :D
	        resource(this, undefined, '', undefined, this);
	    }
	
	    _createClass(RestClient, [{
	        key: 'conf',
	        value: function conf() {
	            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	
	            var currentOptions = this._opts || {
	                trailing: '',
	                shortcut: true,
	                shortcutRules: [],
	                contentType: 'application/json',
	                'application/x-www-form-urlencoded': { encode: encodeUrl },
	                'application/json': { encode: JSON.stringify, decode: JSON.parse }
	            };
	
	            this._opts = _extends(currentOptions, options);
	
	            return _extends({}, this._opts);
	        }
	    }, {
	        key: '_request',
	        value: function _request(method, url) {
	            var _this = this;
	
	            var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	            var contentType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	
	            if (url.indexOf('?') === -1) url += this._opts.trailing;else url = url.replace('?', this._opts.trailing + '?');
	
	            var xhr = new XMLHttpRequest();
	            xhr.open(method, this.host + url, true);
	
	            if (contentType) {
	                var mime = this._opts[contentType];
	                if (mime && mime.encode) data = safe(mime.encode, data);
	                if (!(contentType === 'multipart/form-data' && data.constructor.name === 'FormData')) xhr.setRequestHeader('Content-Type', contentType);
	            }
	
	            var p = new Promise(function (resolve, reject) {
	                return xhr.onreadystatechange = function () {
	                    if (xhr.readyState === 4) {
	                        _this.emit('response', xhr);
	                        p.emit('response', xhr);
	                        if (xhr.status === 200 || xhr.status === 201 || xhr.status === 204) {
	                            _this.emit('success', xhr);
	                            p.emit('success', xhr);
	
	                            var res = xhr.response;
	                            var responseHeader = xhr.getResponseHeader('Content-Type');
	                            if (responseHeader) {
	                                var responseContentType = responseHeader.split(';')[0];
	                                var _mime = _this._opts[responseContentType];
	                                if (_mime && _mime.decode) res = safe(_mime.decode, res);
	                            }
	                            p.off();
	                            resolve(res);
	                        } else {
	                            _this.emit('error', xhr);
	                            p.emit('error', xhr);
	                            p.off();
	                            reject(xhr);
	                        }
	                    }
	                };
	            });
	            new _minivents2.default(p);
	            setTimeout(function () {
	                _this.emit('request', xhr);
	                p.emit('request', xhr);
	                xhr.send(data);
	            }, 0);
	            return p;
	        }
	    }]);
	
	    return RestClient;
	}();
	
	function resource(client, parent, name, id, ctx) {
	    var self = ctx ? ctx : function (newId) {
	        if (newId === undefined) return self;
	        return self._clone(parent, newId);
	    };
	
	    self._resources = {};
	    self._shortcuts = {};
	
	    self._clone = function (parent, newId) {
	        var copy = resource(client, parent, name, newId);
	        copy._shortcuts = self._shortcuts;
	        for (var resName in self._resources) {
	            copy._resources[resName] = self._resources[resName]._clone(copy);
	
	            if (resName in copy._shortcuts) copy[resName] = copy._resources[resName];
	        }
	        return copy;
	    };
	
	    self.res = function (resources) {
	        var shortcut = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : client._opts.shortcut;
	
	        var makeRes = function makeRes(resName) {
	            if (resName in self._resources) return self._resources[resName];
	
	            var r = resource(client, self, resName);
	            self._resources[resName] = r;
	            if (shortcut) {
	                self._shortcuts[resName] = r;
	                self[resName] = r;
	                client._opts.shortcutRules.forEach(function (rule) {
	                    var customShortcut = rule(resName);
	                    if (customShortcut && typeof customShortcut === 'string') {
	                        self._shortcuts[customShortcut] = r;
	                        self[customShortcut] = r;
	                    }
	                });
	            }
	            return r;
	        };
	
	        // (resources instanceof String) don't work. Fuck you, javascript.
	        if (resources.constructor === String) return makeRes(resources);
	
	        if (resources instanceof Array) return resources.map(makeRes);
	
	        if (resources instanceof Object) {
	            var res = {};
	            for (var resName in resources) {
	                var r = makeRes(resName);
	                if (resources[resName]) r.res(resources[resName]);
	                res[resName] = r;
	            }
	            return res;
	        }
	    };
	
	    self.url = function () {
	        var url = parent ? parent.url() : '';
	        if (name) url += '/' + name;
	        if (id !== undefined) url += '/' + id;
	        return url;
	    };
	
	    self.get = function () {
	        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	            args[_key] = arguments[_key];
	        }
	
	        var url = self.url();
	        var query = args.map(encodeUrl).join('&');
	        if (query) url += '?' + query;
	        return client._request('GET', url);
	    };
	
	    self.post = function (data) {
	        var contentType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : client._opts.contentType;
	
	        return client._request('POST', self.url(), data, contentType);
	    };
	
	    self.put = function (data) {
	        var contentType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : client._opts.contentType;
	
	        return client._request('PUT', self.url(), data, contentType);
	    };
	
	    self.patch = function (data) {
	        var contentType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : client._opts.contentType;
	
	        return client._request('PATCH', self.url(), data, contentType);
	    };
	
	    self.delete = function () {
	        return client._request('DELETE', self.url());
	    };
	    return self;
	}
	
	module.exports = RestClient;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports=function(n){var t={},e=[];n=n||this,n.on=function(e,r,l){return(t[e]=t[e]||[]).push([r,l]),n},n.off=function(r,l){r||(t={});for(var o=t[r]||e,u=o.length=l?o.length:0;u--;)l==o[u][0]&&o.splice(u,1);return n},n.emit=function(r){for(var l,o=t[r]||e,u=o.length>0?o.slice(0,o.length):o,i=0;l=u[i++];)l[0].apply(l[1],e.slice.call(arguments,1));return n}};

/***/ })
/******/ ])
});
;
//# sourceMappingURL=rest-client.js.map