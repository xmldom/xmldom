'use strict'

var vows = require('vows')
var DOMParser = require('../../lib/dom-parser').DOMParser
var assert = require('../assert')

describe('errorHandle', () => {
	it('empty document', () => {
		var errors = []
		var p = new DOMParser({
			errorHandler: function (key, msg) {
				errors.push(key, msg)
			},
		})
		var dom = p.parseFromString('', 'text/xml')
		assert(errors.length, 2)
	})

	it('unclosed document', () => {
		var errors = []
		var p = new DOMParser({
			errorHandler: function (key, msg) {
				errors.push(key, msg)
			},
		})
		var dom = p.parseFromString('<img>', 'text/xml')
		assert(errors.length, 2)
	})

	it('unclosed hmtl tags', () => {
		var errors = []
		var p = new DOMParser({
			errorHandler: function (key, msg) {
				errors.push(key, msg)
			},
		})
		var dom = p.parseFromString('<img>', 'text/html')
		assert(errors.length, 0, 'unclosed html tag not need report!!')
	})

	it('invalid xml node', () => {
		var errors = []
		var p = new DOMParser({
			errorHandler: function (key, msg) {
				errors.push(key, msg)
			},
		})
		assert.equal(
			p.parseFromString('<test><!--', 'text/xml').documentElement + '',
			'<test/>'
		)
		assert(errors.length, 4)
		errors = []
		assert.equal(
			p.parseFromString('<r', 'text/xml').documentElement + '',
			'<r/>'
		)
		assert(errors.length, 4)
	})

	it('invalid html attribute (miss quote)', () => {
		var errors = []
		var p = new DOMParser({
			errorHandler: function (key, msg) {
				errors.push(key, msg)
			},
		})
		var dom = p.parseFromString('<img attr=1/>', 'text/html')
		assert(errors.length, 2, 'invalid xml attribute(miss qute)')
		assert(dom + '', '<img attr="1" xmlns="http://www.w3.org/1999/xhtml"/>')
	})

	it('valid html attribute value (<>&)', () => {
		var dom = new DOMParser({}).parseFromString(
			'<img attr="<>&"/>',
			'text/html'
		)
		assert(
			dom + '',
			'<img attr="&lt;>&amp;" xmlns="http://www.w3.org/1999/xhtml"/>',
			'invalid xml attribute valus (<)'
		)
	})
})
