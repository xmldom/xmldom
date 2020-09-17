'use strict'

var wows = require('vows'),
	assert = require('../assert')
var DOMParser = require('../../lib/dom-parser').DOMParser
var XMLSerializer = require('../../lib/dom-parser').XMLSerializer

describe('errorHandle', () => {
	it('unclosed tag', () => {
		assert(new DOMParser().parseFromString('<foo') + '', '<foo/>')
	})

	it('document source', () => {
		var testSource = '<?xml version="1.0"?>\n<!--test-->\n<xml/>'
		var dom = new DOMParser().parseFromString(testSource, 'text/xml')
		assert(new XMLSerializer().serializeToString(dom), testSource)
	})

	it('test', () => {
		var description = '<p>populaciji (< 0.1%), te se</p>'
		var doc = new DOMParser().parseFromString(description, 'text/html')
		assert(
			doc.toString(),
			'<p xmlns="http://www.w3.org/1999/xhtml">populaciji (&lt; 0.1%), te se</p>'
		)
	})
})
