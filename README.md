# another-rest-client [![Build Status](https://travis-ci.org/Amareis/another-rest-client.svg?branch=master)](https://travis-ci.org/Amareis/another-rest-client)
Simple REST API client that makes your code lesser and more beautiful than without it.

There is some rest clients - [restful.js](https://github.com/marmelab/restful.js), [cujojs/rest](https://github.com/cujojs/rest) or [amygdala](https://github.com/lincolnloop/amygdala) - so why you need another rest client? Because with it your code less and more beautiful than without it or with any analogs. Also, its code really simple - less than 200 sloc and (almost) without magic, so you can just read it (and fix, may be?) if something go wrong.

To prove my words, here is an minimal working code (you can explore more examples [here](https://github.com/Amareis/another-rest-client/tree/master/examples)):
```js
var api = new RestClient('https://api.github.com');
api.res({repos: 'releases'});

api.repos('Amareis/another-rest-client').releases('latest').get().then(function(release){
    console.log(release);
    document.write('Latest release of another-rest-client:<br>');
    document.write('Published at: ' + release.published_at + '<br>');
    document.write('Tag: ' + release.tag_name + '<br>');
});
```

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
**ATTENTION:** If you want to use another-rest-client with node.js, you must define XMLHttpRequest before import ([see here](https://github.com/driverdan/node-XMLHttpRequest)):
```js
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
```

## Usage
```js
var api = new RestClient('http://example.com');
```
And here we go! First, let's define resources, using `res` method:
```js
api.res('cookies');         //it gets resource name and returns resource
api.res(['cows', 'bees']);  //or it gets array of resource names and returns array of resources
api.res({       //or it gets object and returns object where resource is available by name
    dogs: [
        'toys',
        'friends'],
    cats: 0,
    humans:
        'posts'
});
/* last string is equal to:
api.res('dogs').res(['toys', 'friends']);
api.res('cats');
api.res('humans').res('posts'); */
```

Now we can query our resources using methods `get` (optionally gets query args), `post`, `put`, `patch` (gets body content) and `delete`. All these methods returns promise, that resolves with object that given by server or rejects with `XMLHttpRequest` instance:
```js
api.cookies.get();              //GET http://example.com/cookies
api.cookies.get({fresh: true}); //GET http://example.com/cookies?fresh=true
api.cookies.get({'filter[]': 'fresh'}, {'filter[]': 'taste'}); //GET http://example.com/cookies?filter%5B%5D=fresh&filter%5B%5D=taste

//POST http://example.com/cows, body="{"color":"white","name":"Moo"}"
api.cows.post({color: 'white', name: 'Moo'}).then(function(cow) {
    console.log(cow);    //just object, i.e. {id: 123, name: 'Moo', color: 'white'}
}, function(xhr) {
    console.log(xhr);   //XMLHtppRequest instance
});
```
If you want query single resource instance, just pass it id into resource:
```js
api.cookies(42).get();  //GET http://example.com/cookies/42

//GET http://example.com/cookies/42?fields=ingridients,baker
api.cookies(42).get({fields: ['ingridients', 'baker']);

api.bees(12).put({state: 'dead'});  //PUT http://example.com/bees/12, body="{"state":"dead"}"
api.cats(64).patch({age: 3});       //PATCH http://example.com/cats/64, body="{"age":3}"
```
You can query subresources easily:
```js
api.dogs(1337).toys.get();          //GET http://example.com/dogs/1337/toys
api.dogs(1337).friends(2).delete(); //DELETE http://example.com/dogs/1337/friends/2

//POST http://example.com/humans/me/posts, body="{"site":"habrahabr.ru","nick":"Amareis"}"
api.humans('me').posts.post({site: 'habrahabr.ru', nick: 'Amareis'});
```
You can use `url` resource method to get resource url:
```js
api.dogs.url() == '/dogs';
api.dogs(1337).friends(1).url() == '/dogs/1337/friends/1';
```
And, of course, you always can use ES6 async/await to make your code more readable:
```js
var me = api.humans('me');
var i = await me.get();
console.log(i);    //just object, i.e. {id: 1, name: 'Amareis', profession: 'programmer'}
var post = await me.posts.post({site: 'habrahabr.ru', nick: i.name})
console.log(post);  //object
```

## Events
`RestClient` use [minivents](https://github.com/allouis/minivents) and emit some events:
- `request` - when `open` XMLHttpRequest, but before `send`.
- `response` - when get server response.
- `success` - when get server response with status 200, 201 or 204.
- `error` - when get server response with another status.

All events gets current XMLHttpRequest instance.

Often use case - authorization:
```js
api.on('request', function(xhr) {
    xhr.setRequestHeader('Authorization', 'Bearer xxxTOKENxxx');
});
```

Also, returns by `get`, `post`, `put`, `patch` and `delete` `Promise` objects also emit these events, but only for current request.
```js
api.dogs(1337).toys.get().on('success', console.log.bind(console)).then(toys => "..."); //in log will be xhr instance
api.dogs(1337).toys.get().then(toys => "..."); //log is clear
```

You can use events to set `responseType` XMLHttpRequest property, to handle binary files (and you can compose it with custom decoders, as described below, to automatically convert blob to File object):
```js
api.files('presentation.pdf').get().on('request', xhr => xhr.responseType = 'blob').then(blobObj => "...");
```

## Configuration
All the examples given above are based on the default settings. If for some reason you are not satisfied, read this section.

All configuration is done using the object passed to the constructor or method `conf`. Some options are also duplicated by optional methods arguments.

`conf` returns full options. If you call it without parameters (just `conf()`), it gives you current options.
```js
console.log(api.conf());
/* Defaults:
{
    trailing: '',
    shortcut: true,
    contentType: 'application/json',
    'application/x-www-form-urlencoded': {encode: encodeUrl},
    'application/json': {encode: JSON.stringify, decode: JSON.parse}
}*/
```

If you want change RestClient host (lol why?..), you can just:
```js
api.host = 'http://example2.com';
```

### Trailing symbol
Some APIs require trailing slash (for example, this is the default behavior in the django-rest-framework). By default another-rest-client doesn't use any trailing symbol, but you can change this:
```js
var api = new RestClient('http://example.com', {trailing: '/'});
//or
api.conf({trailing: '/'});
```
Of course, you can pass all you want (`{trailing: '/i-have-no-idea-why-you-want-this-but-you-can/'}`).

### Shortcuts
Shortcuts - resources and subresources, that accessible as parent resource field:
```js
api.cars == undefined;
var cars = api.res('cars');
api.cars == cars;   //api.cars is shortcut for 'cars' resource
```
By default, another-rest-client will make shortcuts for defined resources. This behavior can be disabled in three ways:
```js
api.sounds == undefined

//first way
var api = new RestClient('http://example.com', {shortcut: false});
//or, second way
api.conf({shortcut: false});
//or, third way
var sounds = api.res('sounds', false);

//and, still...
api.sounds == undefined;
```
First two ways disables shortcuts globally - on all resources and subresources. Third way disables shortcuts locally - in one `res` call. Also, with third way you can locally *enable* shortcuts (pass `true` as second `res` argument) when globally they are disabled.

Local disable of shortcuts can solve some name conflicts (when resource shortcut overwrites some method), but, probably, you will not be affected by this.

**It is strongly recommended do not disable the shortcuts, they greatly enhance code readability.**

You can also add custom shortcuts for resources via rules. Those can be configured via the `shortcutRules` array in the options. When a resource is added all rules will be invoked with the resource name as argument. If the return value is a non-empty string, it will serve as an additional shortcut.

Have a look at this example which will convert strings with dashes into their camel-case counterpart to serve as additional shortcut:

```js
const DASH_REG = /(-)(.)/g;
function dashReplace(resourceName) {
    return resourceName.replace(DASH_REG, (match, p1, p2) => p2.toUpperCase());
}

var api = new RestClient('http://example.com', {shortcutRules: [ dashReplace ]});
api.res('engine-rest');
api['engine-rest']; // standard shortcut
api.engineRest;     // custom shortcut to improve readability
```

### Request content type
When you call `post`, `put` or `patch`, you pass an object to be encoded into string and sent to the server. But how it will be encoded and what `Content-Type` header will be set?
By default - in json (`application/json`), using `JSON.stringify`. To change this behavior, you can manually set request content type:
```js
var api = new RestClient('http://example.com', {contentType: 'application/x-www-form-urlencoded'});
//or by conf
api.conf({contentType: 'application/x-www-form-urlencoded'});
//or by second argument in 'post', 'put' or 'patch'
api.cookies.post({fresh: true}, 'application/x-www-form-urlencoded');
```
By default RestClient can encode data in `application/json` and `application/x-www-form-urlencoded`. You can add (or replace defaults with) your own encoders:
```js
var opts = {
    contentType: 'application/x-my-cool-mime',
    'application/x-my-cool-mime': {
        encode: function (objectPassedToPostPutOrPatch) {
            //...
            return encodedToStringObject;
        }
    }
}
var api = new RestClient('http://example.com', opts);
//or by conf
api.conf(opts);
```
If there is no suitable encoder, passed object will be passed to the XMLHttpRequest.send without changes.

### Response content type
When server answers, it give `Content-Type` header. another-rest-client smart enough to parse it and decode `XMLHttpRequest.responseText` into object. By default it can decode only `application/json` using `JSON.parse`, but you can add your own decoders:
```js
var opts = {
    'application/x-my-cool-mime': {
        decode: function (stringFromXhrResponseText) {
            //...
            return decodedFromStringObject;
        }
    }
}
var api = new RestClient('http://example.com', opts);
//or by conf
api.conf(opts);
```
If there is no suitable decoder (or server given't `Content-Type` header), gotten `XMLHttpRequest.response` will be passed to Promise.resolve without changes.

Of course, you can combine encoders and decoders for single MIME:
```js
var opts = {
    contentType: 'application/x-my-cool-mime',
    'application/x-my-cool-mime': {
        encode: function (objectPassedToPostPutOrPatch) {
            //...
            return encodedToStringObject;
        },
        decode: function (stringFromXhrResponseText) {
            //...
            return decodedFromStringObject;
        }
    }
}
var api = new RestClient('http://example.com', opts);
//or by conf
api.conf(opts);
```

## Contributing
That's easy:
```bash
git clone https://github.com/Amareis/another-rest-client.git
cd another-rest-client
npm install
echo "//Some changes..." >> src/rest-client.js
npm run build && npm test
```
