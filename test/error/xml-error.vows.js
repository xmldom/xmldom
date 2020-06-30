var vows = require('vows');
var DOMParser = require('../../lib/dom-parser').DOMParser;
var assert = require('../assert');


vows.describe('errorHandle').addBatch({
  'empty document': function() {
  	var errors = [];
	var p = new DOMParser({
		errorHandler: function(key,msg){
		errors.push(key, msg)
	}
	});
	var dom = p.parseFromString('', 'text/xml');
	assert(errors.length, 2)
  },
  'unclosed document': function() {
  	var errors = [];
	var p = new DOMParser({
		errorHandler: function(key,msg){
		errors.push(key, msg)
	}
	});
	var dom = p.parseFromString('<img>', 'text/xml');
	assert(errors.length, 2)
  },
  'unclosed hmtl tags': function() {
  	var errors = [];
	var p = new DOMParser({
		errorHandler: function(key,msg){
		errors.push(key, msg)
	}
	});
	var dom = p.parseFromString('<img>', 'text/html');
	assert(errors.length, 0,"unclosed html tag not need report!!")
  },
  "invalid xml node":function(){
		var errors = [];
		var p = new DOMParser({
			errorHandler: function(key,msg){
				errors.push(key, msg)
			}
		});
		assert.equal(
			p.parseFromString('<test><!--', 'text/xml').documentElement+'',
			'<test/>'
		)
		assert(errors.length, 4)
		errors = []
		assert.equal(
			p.parseFromString('<r', 'text/xml').documentElement+'',
			'<r/>'
		)
		assert(errors.length, 4)
  },
  'invalid html attribute (miss quote)': function() {
  	var errors = [];
	var p = new DOMParser({
		errorHandler: function(key,msg){
		errors.push(key, msg)
	}
	});
	var dom = p.parseFromString('<img attr=1/>', 'text/html');
	assert(errors.length, 2,"invalid xml attribute(miss qute)")
	assert(dom+'', '<img attr="1" xmlns="http://www.w3.org/1999/xhtml"/>')
  },
  'valid html attribute value (<>&)': function() {
		var dom = new DOMParser({}).parseFromString('<img attr="<>&"/>', 'text/html');
		assert(dom+'', '<img attr="&lt;>&amp;" xmlns="http://www.w3.org/1999/xhtml"/>',"invalid xml attribute valus (<)")
  }
}).export(module);
