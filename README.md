# another-rest-client [![Build Status](https://travis-ci.org/Amareis/another-rest-client.svg?branch=master)](https://travis-ci.org/Amareis/another-rest-client)
Simple REST API client that makes your code lesser and more beautiful than without it.

There is some rest clients - [restful.js](https://github.com/marmelab/restful.js) or [cujojs/rest](https://github.com/cujojs/rest) - so why you need another rest client? Because with it your code less and more beautiful than without it or with any analogs. Also, its code really simple - less than 200 sloc and (almost) without magic, so you can just read it (and fix, may be?) if something go wrong.

**ATTENTION:** If you want use another-rest-client with node.js, you must define XMLHttpRequest before import it:
```js
global.XMLHttpRequest = require('xmlhttprequest')
```
Now, let's go.

## Installation
Library is available with bower or npm:
```
bower install --save another-rest-client
npm install --save-dev another-rest-client
```
Now, add it in script tag or require it or import it:
```html
<script src="bower_components/another-rest-client/rest-client.js">
var RestClient = require('another-rest-client');
import RestClient from 'another-rest-client'
```
And...
```js
var api = new RestClient('http://example.com');
```
Here we go!
