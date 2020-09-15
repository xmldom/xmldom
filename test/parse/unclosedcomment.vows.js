var wows = require('vows'),
	assert = require('../assert')
var DOMParser = require('../../lib/dom-parser').DOMParser

wows
	.describe('errorHandle')
	.addBatch({
		unclosedcomment: function () {
			var parser = new DOMParser()
			var doc = parser.parseFromString('<!--', 'text/xml')
			assert(doc + '', '!--')
		},
	})
	.export(module)
