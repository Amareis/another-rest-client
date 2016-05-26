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

## Usage
```js
var api = new RestClient('http://example.com');
```
And here we go!

```js
api.res('cookies');
api.cookies.get();              //GET http://example.com/cookies
api.cookies.get({fresh: true}); //GET http://example.com/cookies?fresh=true
api.cookies(42).get();          //GET http://example.com/cookies/42
api.cookies(42).get({fields: ['ingridients', 'baker']);  //GET http://example.com/cookies/42?fields=ingridients,baker

api.res(['cows', 'bees']);
api.cows.post({color: 'white', name: 'Moo'});   //POST http://example.com/cows, body="{"color":"white","name":"Moo"}"
api.bees(12).put({state: 'dead'});  //PUT http://example.com/bees/12, body="{"state":"dead"}"

api.res({dogs: ['toys', 'friends'], cats: 0, humans: 'posts'});
api.dogs(1337).toys.get();          //GET http://example.com/dogs/1337/toys
api.dogs(1337).friends(2).delete(); //DELETE http://example.com/dogs/1337/friends/2
api.cats(64).patch({age: 3});       //PATCH http://example.com/cats/64, body="{"age":3}"

var i = api.humans('me');
var myPosts = i.posts;
i.get().then(function(me) { //GET http://example.com/humans/me
    console.log(me);    //just object, i.e. {id: 1, name: 'Amareis', profession: 'programmer'}
    myPosts.post({site: 'habrahabr.ru', nick: 'Amareis'}).then(function(post) {
        console.log(post);  //object
    });
});

//or, if you respect ES6...
var me = await i.get();
console.log(me);    //just object, i.e. {id: 1, name: 'Amareis', profession: 'programmer'}
var post = await myPosts.post({site: 'habrahabr.ru', nick: me.name})
console.log(post);  //object
```