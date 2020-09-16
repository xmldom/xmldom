var wows = require('vows');
var assert = require('../assert');
var DOMParser = require('../../lib/dom-parser').DOMParser;
var XMLSerializer = require('../../lib/dom-parser').XMLSerializer;
var parser = new DOMParser();

wows.describe('XML Node Parse').addBatch({
    'noAttribute': function () {
			const expected = '<xml/>'
			assert(new DOMParser().parseFromString('<xml ></xml>','text/xml')+'', expected);
    	assert(new DOMParser().parseFromString('<xml></xml>','text/xml')+'', expected);
    	assert(new DOMParser().parseFromString('<xml />','text/xml')+'', expected);
    	assert(new DOMParser().parseFromString(expected,'text/xml')+'', expected);
	},
    'simpleAttribute': function () {
			const expected = '<xml a="1" b="2"/>'
			const expectedEmptyB = '<xml a="1" b=""/>'
			assert(new DOMParser().parseFromString('<xml a="1" b="2"></xml>','text/xml'), expected);
    	assert(new DOMParser().parseFromString('<xml a="1" b="2" ></xml>','text/xml'), expected);
			assert(new DOMParser().parseFromString('<xml a="1" b=\'\'></xml>','text/xml'), expectedEmptyB);
    	assert(new DOMParser().parseFromString('<xml a="1" b=\'\' ></xml>','text/xml'), expectedEmptyB);
    	assert(new DOMParser().parseFromString('<xml a="1" b="2/">','text/xml'), '<xml a="1" b="2/"/>');
    	assert(new DOMParser().parseFromString('<xml a="1" b="2" />','text/xml'), expected);
    	assert(new DOMParser().parseFromString('<xml  a="1" b=\'\'/>','text/xml'), expectedEmptyB);
    	assert(new DOMParser().parseFromString('<xml  a="1" b=\'\' />','text/xml'), expectedEmptyB);
	},
    'nsAttribute': function () {
    	const expected = '<xml xmlns="1" xmlns:a="2" a:test="3"/>';
    	assert(new DOMParser().parseFromString('<xml xmlns="1" xmlns:a="2" a:test="3"></xml>','text/xml'), expected);
    	assert(new DOMParser().parseFromString('<xml xmlns="1" xmlns:a="2" a:test="3" ></xml>','text/xml'), expected);
     	assert(new DOMParser().parseFromString('<xml xmlns="1" xmlns:a="2" a:test="3/">','text/xml'), expected.replace('3', '3/'));
    	assert(new DOMParser().parseFromString('<xml xmlns="1" xmlns:a="2" a:test="3" />','text/xml'), expected);
	}
}).export(module);
