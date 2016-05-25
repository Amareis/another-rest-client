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
	
	            for (var k in this._opts) {
	                if (k in options) this._opts[k] = options[k];
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
	                        _this.emit('answer', xhr);
	                        if (xhr.status == 200 || xhr.status == 201 || xhr.status == 204) {
	                            _this.emit('success', xhr);
	
	                            var responseContentType = xhr.getResponseHeader('Content-Type');
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
	
	        var copy = resource(client, parent, name, newId);
	        copy._shortcuts = self._shortcuts;
	        for (var resName in self._resources) {
	            var original = self._resources[resName];
	            var derived = resource(client, copy, resName);
	            derived._resources = original._resources;
	            derived._shortcuts = original._shortcuts;
	
	            copy._resources[resName] = derived;
	            if (resName in self._shortcuts) copy[resName] = derived;
	        }
	        return copy;
	    };
	
	    self._resources = {};
	    self._shortcuts = {};
	
	    self.res = function (resourceName) {
	        var shortcut = arguments.length <= 1 || arguments[1] === undefined ? client._opts.shortcut : arguments[1];
	
	        var resourceArray = [].concat(resourceName);
	        var results = [];
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;
	
	        try {
	            for (var _iterator = resourceArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                var resName = _step.value;
	
	                var r = self._resources[resName] || resource(client, self, resName);
	                self._resources[resName] = r;
	                if (shortcut) {
	                    self._shortcuts[resName] = r;
	                    self[resName] = r;
	                }
	                results.push(r);
	            }
	        } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion && _iterator.return) {
	                    _iterator.return();
	                }
	            } finally {
	                if (_didIteratorError) {
	                    throw _iteratorError;
	                }
	            }
	        }
	
	        if (resourceName instanceof Array) return results;
	        return results[0];
	    };
	
	    self.url = function () {
	        var url = parent ? parent.url() : '';
	        if (name) url += '/' + name;
	        if (id != undefined) url += '/' + id;
	        return url;
	    };
	
	    if (id == undefined) {
	        self.add = function (data) {
	            var contentType = arguments.length <= 1 || arguments[1] === undefined ? client._opts.contentType : arguments[1];
	
	            return client._request('POST', self.url(), data, contentType);
	        };
	
	        self.get = function (args) {
	            var url = self.url();
	            if (args) url += '?' + encodeUrl(args);
	            return client._request('GET', url);
	        };
	    } else {
	        self.get = function () {
	            return client._request('GET', self.url());
	        };
	
	        self.upd = function (data) {
	            var contentType = arguments.length <= 1 || arguments[1] === undefined ? client._opts.contentType : arguments[1];
	
	            return client._request('PUT', self.url(), data, contentType);
	        };
	
	        self.del = function () {
	            return client._request('DELETE', self.url());
	        };
	    }
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