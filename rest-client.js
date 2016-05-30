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
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
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
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	            this._opts = this._opts || {
	                trailing: '',
	                shortcut: true,
	                contentType: 'application/json',
	                'application/x-www-form-urlencoded': { encode: encodeUrl },
	                'application/json': { encode: JSON.stringify, decode: JSON.parse }
	            };
	
	            for (var k in options) {
	                this._opts[k] = options[k];
	            }
	        }
	    }, {
	        key: '_request',
	        value: function _request(method, url) {
	            var _this = this;
	
	            var data = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
	            var contentType = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
	
	            if (url.indexOf('?') == -1) url += this._opts.trailing;else url = url.replace('?', this._opts.trailing + '?');
	
	            var xhr = new XMLHttpRequest();
	            xhr.open(method, this.host + url, true);
	
	            if (contentType) {
	                var mime = this._opts[contentType];
	                if (mime && mime.encode) data = mime.encode(data);
	                xhr.setRequestHeader('Content-Type', contentType);
	            }
	
	            this.emit('request', xhr);
	
	            var p = new Promise(function (resolve, reject) {
	                xhr.onreadystatechange = function () {
	                    if (xhr.readyState == 4) {
	                        _this.emit('response', xhr);
	                        if (xhr.status == 200 || xhr.status == 201 || xhr.status == 204) {
	                            _this.emit('success', xhr);
	
	                            var responseContentType = xhr.getResponseHeader('Content-Type').split(';')[0];
	                            var _mime = _this._opts[responseContentType];
	                            var res = xhr.responseText;
	                            if (_mime && _mime.decode) res = _mime.decode(res);
	
	                            resolve(res);
	                        } else {
	                            _this.emit('error', xhr);
	                            reject(xhr);
	                        }
	                    }
	                };
	            });
	            xhr.send(data);
	            return p;
	        }
	    }]);
	
	    return RestClient;
	}();
	
	function resource(client, parent, name, id, ctx) {
	    var self = ctx ? ctx : function (newId) {
	        if (newId == undefined) return self;
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
	        var shortcut = arguments.length <= 1 || arguments[1] === undefined ? client._opts.shortcut : arguments[1];
	
	        var makeRes = function makeRes(resName) {
	            if (resName in self._resources) return self._resources[resName];
	
	            var r = resource(client, self, resName);
	            self._resources[resName] = r;
	            if (shortcut) {
	                self._shortcuts[resName] = r;
	                self[resName] = r;
	            }
	            return r;
	        };
	
	        // (resources instanceof String) don't work. Fuck you, javascript.
	        if (resources.constructor == String) return makeRes(resources);
	
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
	        if (id != undefined) url += '/' + id;
	        return url;
	    };
	
	    self.get = function (args) {
	        var url = self.url();
	        if (args) url += '?' + encodeUrl(args);
	        return client._request('GET', url);
	    };
	
	    self.post = function (data) {
	        var contentType = arguments.length <= 1 || arguments[1] === undefined ? client._opts.contentType : arguments[1];
	
	        return client._request('POST', self.url(), data, contentType);
	    };
	
	    self.put = function (data) {
	        var contentType = arguments.length <= 1 || arguments[1] === undefined ? client._opts.contentType : arguments[1];
	
	        return client._request('PUT', self.url(), data, contentType);
	    };
	
	    self.patch = function (data) {
	        var contentType = arguments.length <= 1 || arguments[1] === undefined ? client._opts.contentType : arguments[1];
	
	        return client._request('PATCH', self.url(), data, contentType);
	    };
	
	    self.delete = function () {
	        return client._request('DELETE', self.url());
	    };
	    return self;
	}
	
	module.exports = RestClient;

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports=function(n){var t={},e=[];n=n||this,n.on=function(n,e,l){(t[n]=t[n]||[]).push([e,l])},n.off=function(n,l){n||(t={});for(var o=t[n]||e,i=o.length=l?o.length:0;i--;)l==o[i][0]&&o.splice(i,1)},n.emit=function(n){for(var l,o=t[n]||e,i=o.length>0?o.slice(0,o.length):o,c=0;l=i[c++];)l[0].apply(l[1],e.slice.call(arguments,1))}};

/***/ }
/******/ ])
});
;
//# sourceMappingURL=rest-client.js.map