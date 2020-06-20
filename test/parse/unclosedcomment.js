var wows = require('vows'),
	assert = require('assert');
var DOMParser = require('../../lib/dom-parser').DOMParser;


wows.describe('errorHandle').addBatch({
  'unclosedcomment': function() {
    var parser = new DOMParser();
	assert['throws'](function () {
		var doc = parser.parseFromString('<!--', 'text/xml');
		console.log(doc+'')
	}, 'Unclosed comment');
  }
}).export(module);
