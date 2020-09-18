'use strict'

var assert = require('../assert')
var DOMParser = require('../../lib/dom-parser').DOMParser

describe('errorHandle', () => {
	it('unclosedcomment', () => {
		var parser = new DOMParser()
		var doc = parser.parseFromString('<!--', 'text/xml')
		assert(doc + '', '!--')
	})
})
