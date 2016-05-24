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
	        this._resources = {};
	
	        this.conf(options);
	        new _minivents2.default(this);
	
	        resource(this, '', '', this);
	    }
	
	    _createClass(RestClient, [{
	        key: 'conf',
	        value: function conf() {
	            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
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
	
	            var xhr = new XMLHttpRequest();
	            xhr.open(method, this.host + url, true);
	
	            if (contentType) {
	                var encoder = this._opts.encoders[contentType];
	                if (encoder) data = encoder(data);
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
	                            var decoder = _this._opts.decoders[responseContentType];
	                            var res = xhr.responseText;
	                            if (decoder) res = decoder(res);
	
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
	
	function resource(client, name, baseUrl, ctx) {
	    var self = ctx ? ctx : function (id) {
	        var res = {};
	        for (var resName in self._resources) {
	            var r = resource(client, resName, self.url(id, false));
	            r._resources = self._resources[resName]._resources;
	            res[resName] = r;
	        }
	        return res;
	    };
	
	    self._resources = {};
	
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
	
	                var r = self._resources[resName] || resource(client, resName, self.url(undefined, false));
	                self._resources[resName] = r;
	                if (shortcut) self[resName] = r;
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
	
	        if (Object.prototype.toString.call(resourceName) === '[object Array]') return results;
	        return results[0];
	    };
	
	    self.url = function (id) {
	        var final = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
	
	        var url = baseUrl;
	        if (name) url += '/' + name;
	        if (id !== undefined) url += '/' + id;
	        if (final) url += client._opts.trailing;
	        return url;
	    };
	
	    self.all = function (args) {
	        var url = self.url();
	        if (args) url += '?' + encodeUrl(args);
	
	        return client._request('GET', url);
	    };
	
	    self.one = function (id) {
	        return client._request('GET', self.url(id));
	    };
	
	    self.add = function (data) {
	        var contentType = arguments.length <= 1 || arguments[1] === undefined ? client._opts.contentType : arguments[1];
	
	        return client._request('POST', self.url(), data, contentType);
	    };
	
	    self.upd = function (id, data) {
	        var contentType = arguments.length <= 2 || arguments[2] === undefined ? client._opts.contentType : arguments[2];
	
	        return client._request('PUT', self.url(id), data, contentType);
	    };
	
	    self.del = function (id) {
	        return client._request('DELETE', self.url(id));
	    };
	    return self;
	}
	
	module.exports = RestClient;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2);

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return function(n){var t={},e=[];n=n||this,n.on=function(n,e,i){(t[n]=t[n]||[]).push([e,i])},n.off=function(n,i){n||(t={});for(var f=t[n]||e,l=f.length=i?f.length:0;l--;)i==f[l][0]&&f.splice(l,1)},n.emit=function(n){for(var i,f=t[n]||e,l=f.length>0?f.slice(0,f.length):f,c=0;i=l[c++];)i[0].apply(i[1],e.slice.call(arguments,1))}}}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }
/******/ ])
});
;
//# sourceMappingURL=rest-client.js.map