# another-rest-client [![Build Status](https://travis-ci.org/Amareis/another-rest-client.svg?branch=master)](https://travis-ci.org/Amareis/another-rest-client)
Simple REST API client that makes your code lesser and more beautiful than without it.

There is some rest clients - [restful.js](https://github.com/marmelab/restful.js) or [cujojs/rest](https://github.com/cujojs/rest) - so why you need another rest client? Because with it your code less and more beautiful than without it or with any analogs. Also, its code really simple - less than 200 sloc and (almost) without magic, so you can just read it (and fix, may be?) if something go wrong.

## Installation
Library is available with bower or npm:
```
bower install --save another-rest-client
npm install --save-dev another-rest-client
```

**ATTENTION:** If you want use another-rest-client with node.js, you must define XMLHttpRequest before import it:
```js
global.XMLHttpRequest = require('xmlhttprequest')
```

Now, add it in script tag or require it or import it:
```html
<script src="bower_components/another-rest-client/rest-client.js">
var RestClient = require('another-rest-client');
import RestClient from 'another-rest-client'
```

## Usage
```js
var api = new RestClient('http://example.com');
```
And here we go!

First, let's define resources, using `res` method, that gets string with resource name, array of resources names or object and returns resource, array of resources or object where resource is available by name.
`res` also exists in resources, so you can define subresources.

Passing string or array just defines resource or resources with given names. Passing object is more complicated - it defines resources with names from object keys **AND** defines subresources, taken from items, so `api.res({dogs: ['toys', friends']})` is equal to `var dogs = api.res('dogs'); dogs.res(['toys', 'friends']);`. If there are no subresources on resource, you can put in item something, that similar to `false` (`false` itself or `0` or `null` or `undefined`).
```js
api.res('cookies');
api.res(['cows', 'bees']);
api.res({dogs: ['toys', 'friends'], cats: 0, humans: 'posts'});
/* last string is equal to:
api.res('dogs).res(['toys', 'friends']);
api.res('cats');
api.res('humans').res('posts'); */
```

Now we can query our API resources using methods `get` (optionally gets query args), `post`, `put`, `patch` (gets body content) and `delete`. All these methods returns promise, that resolves with object that given by server or rejects with `XMLHttpRequest` instance.
```js
api.cookies.get();              //GET http://example.com/cookies
api.cookies.get({fresh: true}); //GET http://example.com/cookies?fresh=true
api.cows.post({color: 'white', name: 'Moo'});  //POST http://example.com/cows, body="{"color":"white","name":"Moo"}"

var me = api.humans('me');
me.get().then(function(i) { //GET http://example.com/humans/me
    console.log(i);    //just object, i.e. {id: 1, name: 'Amareis', profession: 'programmer'}
}, function(xhr) {
    console.log(xhr);   //XMLHtppRequest instance
});
```
If you want query single resource instance, just pass it id into resource.
```js
api.cookies(42).get();          //GET http://example.com/cookies/42
api.cookies(42).get({fields: ['ingridients', 'baker']);  //GET http://example.com/cookies/42?fields=ingridients,baker

api.bees(12).put({state: 'dead'});  //PUT http://example.com/bees/12, body="{"state":"dead"}"
api.cats(64).patch({age: 3});       //PATCH http://example.com/cats/64, body="{"age":3}"
```
You can query subresources easily.
```js
api.dogs(1337).toys.get();          //GET http://example.com/dogs/1337/toys
api.dogs(1337).friends(2).delete(); //DELETE http://example.com/dogs/1337/friends/2

me.posts.post({site: 'habrahabr.ru', nick: 'Amareis'}).then(function(post) {
    console.log(post);  //object
});
```
And, of course, you can use ES6 async/await to make your code more readable.
```js
var me = api.humans('me');
var i = await me.get();
console.log(i);    //just object, i.e. {id: 1, name: 'Amareis', profession: 'programmer'}
var post = await me.posts.post({site: 'habrahabr.ru', nick: i.name})
console.log(post);  //object
```
All the examples given above are based on the default settings If for some reason you are not satisfied, read on (or create an issue if the next section is not helped).
