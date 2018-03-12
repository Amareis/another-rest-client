var should = require('chai').should();
var sinon = require('sinon');
var FormData = require('form-data');

var RestClient = require('../rest-client');

var host = 'http://example.com';

xhr = global.XMLHttpRequest = sinon.useFakeXMLHttpRequest();
global.FormData = FormData;

describe('RestClient', () => {
    describe('#_request()', () => {
        var api;

        beforeEach(() => {
            api = new RestClient(host);
            api.res('cookies');
        });

        it('should append trailing symbol which passed to constructor', () => {
            var req;
            xhr.onCreate = r => req = r;

            new RestClient(host, {trailing: '/'}).res('cookies').get();
            req.url.should.be.equal(host + '/cookies/');
        });

        it('should append trailing symbol before args', () => {
            var req;
            xhr.onCreate = r => req = r;

            new RestClient(host, {trailing: '/'}).res('cookies').get({fresh: true});
            req.url.should.be.equal(host + '/cookies/?fresh=true');
        });

        it('should emit events', (done) => {
            var req, bool;
            xhr.onCreate = r => req = r;

            var p = api.on('request', xhr => bool = true).cookies.get({fresh: true});
            req.url.should.be.equal(host + '/cookies?fresh=true');

            setTimeout(() => req.respond(200, [], '{a:1}'), 0);

            p.then(() => {
                bool.should.be.equal(true)
                done();
            }).catch(done);
        });

        it('should correct handle form data', () => {
            var req;
            xhr.onCreate = r => req = r;

            var p = api.cookies.post(new FormData(), 'multipart/form-data');
            req.url.should.be.equal(host + '/cookies');
            (typeof req.requestHeaders['Content-Type']).should.be.equal('undefined');
        });
    });
});


describe('resource', () => {
    describe('#res()', () => {
        var api;

        beforeEach(() => api = new RestClient(host));

        it('should accept resource name and return resource', () => {
            var cookies = api.res('cookies');
            cookies.should.be.a('function');
        });

        it('should accept array of resource names and return array of resources', () => {
            var t = api.res(['bees', 'cows']);
            t.should.be.an('array');
        });

        it('should accept object of resource names and return object of resources', () => {
            var t = api.res({
                'bees': [
                    'big',
                    'small'
                ],
                'cows': {
                    'white': 'good'
                },
                'dogs': 0
            });
            t.should.be.an('object');

            api.bees.should.be.a('function');
            api.bees.big.should.be.a('function');
            api.bees.small.should.be.a('function');

            api.cows.should.be.a('function');
            api.cows.white.should.be.a('function');
            api.cows.white.good.should.be.a('function');

            api.dogs.should.be.a('function');
        });

        it('should make a shortcut for resource by default', () => {
            api.should.not.have.property('cookies');
            var cookies = api.res('cookies');
            api.cookies.should.be.equal(cookies);
        });

        it('should make a shortcut for resource array by default', () => {
            api.should.not.have.property('cookies');
            api.should.not.have.property('cows');

            var arr = api.res(['cookies', 'cows']);

            api.cookies.should.be.equal(arr[0]);
            api.cows.should.be.equal(arr[1]);
        });

        it('should not make a shortcut if pass option to constructor', () => {
            var api = new RestClient(host, {shortcut: false});
            api.should.not.have.property('cookies');
            var cookies = api.res('cookies');
            api.should.not.have.property('cookies');
        });

        it('should not make a shortcut if pass false to second option', () => {
            api.should.not.have.property('cookies');
            var cookies = api.res('cookies', false);
            api.should.not.have.property('cookies');
        });

        it('should cache created resources', () => {
            var cookies = api.res('cookies');
            cookies.should.be.a('function');
            var cookies2 = api.res('cookies');
            cookies.should.be.eql(cookies2);
        });

        it('should add additional shortcuts for custom rules', () => {
            var r = /(-)(.)/g;
            var api = new RestClient(host, {shortcutRules: [
                resName => resName.replace(r, (match, p1, p2) => p2.toUpperCase()),
            ]});

            api.should.not.have.property('cookies-and-biscuits');
            api.should.not.have.property('cookiesAndBiscuits');

            var cookiesAndBiscuits = api.res('cookies-and-biscuits');

            cookiesAndBiscuits.should.be.a('function');
            api['cookies-and-biscuits'].should.be.equal(cookiesAndBiscuits);
            api.cookiesAndBiscuits.should.be.equal(cookiesAndBiscuits);
        });
    });

    describe('#url()', () => {
        var api;

        beforeEach(() => {
            api = new RestClient(host);
            api.res('cookies');
        });

        it('should build correct resource url', () => {
            api.cookies.url().should.be.equal('/cookies');
        });

        it('should build correct resource instance url', () => {
            api.cookies(42).url().should.be.equal('/cookies/42');
        });

        it('should build correct resource url if two in stack', () => {
            api.cookies.res('bakers');
            api.cookies(42).bakers(24).url().should.be.equal('/cookies/42/bakers/24');
        });

        it('should build correct resource url if more than two in stack', () => {
            api.cookies.res('bakers').res('cats');
            api.cookies(42).bakers.cats.url().should.be.equal('/cookies/42/bakers/cats');
            api.cookies(42).bakers(24).cats(15).url().should.be.equal('/cookies/42/bakers/24/cats/15');
        });
    });

    describe('#get()', () => {
        var api;

        beforeEach(() => {
            api = new RestClient(host);
            api.res('cookies');
        });

        it('should correct form query args when get one instance', () => {
            var req;
            xhr.onCreate = r => req = r;

            api.cookies(4).get();
            req.url.should.be.equal(host + '/cookies/4');
        });

        it('should correct form query args when get multiply instances', () => {
            var req;
            xhr.onCreate = r => req = r;

            api.cookies.get({fresh: true});
            req.url.should.be.equal(host + '/cookies?fresh=true');
        });

        it('should correct form query args when get multiply args', () => {
            var req;
            xhr.onCreate = r => req = r;

            api.cookies.get({'filter[]': 'fresh'}, {'filter[]': 'taste'});
            req.url.should.be.equal(host + '/cookies?filter%5B%5D=fresh&filter%5B%5D=taste');
        });

        it('should work correctly with an undefined content type', (done) => {
            var req;
            xhr.onCreate = r => req = r;

            var p = api.cookies.get({fresh: true});

            req.respond(200, [], '{a:1}');

            req.url.should.be.equal(host + '/cookies?fresh=true');
            p.then(r => {
                r.should.be.equal('{a:1}');
                done();
            }).catch(done);
        });

        it('should correctly parse response', (done) => {
            var req;
            xhr.onCreate = r => req = r;

            var p = api.cookies.get({fresh: true});

            req.respond(200, {'Content-Type': 'application/json'}, '{"a":"1df"}');

            req.url.should.be.equal(host + '/cookies?fresh=true');
            p.then(r => {
                r.should.be.deep.equal({"a": "1df"});
                done();
            }).catch(done);
        });

        it('should correctly handle exception with wrong encoded response body', (done) => {
            var req;
            xhr.onCreate = r => req = r;
            sinon.spy(console, 'error');
            sinon.spy(console, 'log');

            var p = api.cookies.get({fresh: true});

            req.respond(200, {'Content-Type': 'application/json'}, '{"a":1df}');

            req.url.should.be.equal(host + '/cookies?fresh=true');
            p.then(r => {
                r.should.be.equal('{"a":1df}');
                console.error.callCount.should.equal(1);
                console.log.callCount.should.equal(3);

                console.error.restore();
                console.log.restore();
                done();
            }).catch(done);
        });

        it('should emit once event', (done) => {
            var req;
            xhr.onCreate = r => req = r;

            var respText;

            var p = api.cookies.get({fresh: true}).on('success', xhr => respText = xhr.responseText);

            setTimeout(() => req.respond(200, [], '{a:1}'), 0);

            req.url.should.be.equal(host + '/cookies?fresh=true');
            p.then(r => {
                r.should.be.equal('{a:1}');
                respText.should.be.equal('{a:1}');
                done();
            }).catch(done);
        });

        it('should emit once request event', (done) => {
            var req;
            xhr.onCreate = r => req = r;

            var bool;

            var p = api.cookies.get({fresh: true}).on('request', xhr => bool = true);

            setTimeout(() => req.respond(200, [], '{a:1}'), 0);

            req.url.should.be.equal(host + '/cookies?fresh=true');
            p.then(r => {
                bool.should.be.equal(true);
                done();
            }).catch(done);
        });
    });
});
