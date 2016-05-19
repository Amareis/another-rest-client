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

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var RestClient = function () {
	    function RestClient(host) {
	        var trailing = arguments.length <= 1 || arguments[1] === undefined ? '/' : arguments[1];

	        _classCallCheck(this, RestClient);

	        this._host = host;
	        this._trailing = trailing;
	    }

	    _createClass(RestClient, [{
	        key: 'res',
	        value: function res(_res) {
	            var shortcut = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

	            var r = new RestResource(this, _res);
	            if (shortcut) this[_res] = r;
	            return r;
	        }
	    }, {
	        key: 'prerequest',
	        value: function prerequest(request) {}
	    }, {
	        key: '_request',
	        value: function _request(method, url, data, args) {
	            function toQuery(dict) {
	                var encode = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

	                var res = '';
	                var encodeFunc = function encodeFunc(t) {
	                    return t;
	                };
	                if (encode) encodeFunc = encodeURIComponent;
	                for (var k in dict) {
	                    //noinspection JSUnfilteredForInLoop
	                    res += encodeFunc(k) + '=' + encodeFunc(dict[k]) + '&';
	                }
	                return res.substr(0, res.length - 1);
	            }

	            url = this._host + url + this._trailing;

	            if (args) url += '?' + toQuery(args);

	            var xhr = new XMLHttpRequest();
	            xhr.open(method, url, true);

	            var contentType = 'application/json';
	            if (method == 'POST') contentType = 'application/x-www-form-urlencoded';
	            xhr.setRequestHeader('Content-Type', contentType);

	            this.prerequest(xhr);

	            var p = new Promise(function (resolve, reject) {
	                xhr.onreadystatechange = function () {
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
	    }]);

	    return RestClient;
	}();

	var RestResource = function () {
	    function RestResource(client, res) {
	        _classCallCheck(this, RestResource);

	        this.client = client;
	        this.res = res;
	    }

	    _createClass(RestResource, [{
	        key: 'add',
	        value: function add(data) {
	            return this.client._request('POST', '/' + this.res, data, null);
	        }
	    }, {
	        key: 'all',
	        value: function all(args) {
	            return this.client._request('GET', '/' + this.res, null, args);
	        }
	    }, {
	        key: 'one',
	        value: function one(id) {
	            return this.client._request('GET', '/' + this.res + '/' + id, null, null);
	        }
	    }, {
	        key: 'upd',
	        value: function upd(id, data) {
	            return this.client._request('PUT', '/' + this.res + '/' + id, data, null);
	        }
	    }, {
	        key: 'del',
	        value: function del(id) {
	            return this.client._request('DELETE', '/' + this.res + '/' + id, null, null);
	        }
	    }]);

	    return RestResource;
	}();

	module.exports = RestClient;

/***/ }
/******/ ])
});
;