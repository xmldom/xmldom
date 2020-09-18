'use strict'

var DOMParser = require('../../lib/dom-parser').DOMParser
const assert = require('../assert')

// Create a Test Suite
describe('XML attrs', () => {
	it('can properly set attribute', () => {
		var root = new DOMParser().parseFromString('<xml/>', 'text/xml')
			.documentElement
		root.setAttribute('a', '1')
		assert(root.attributes[0].localName, 'a')
		root.setAttribute('b', 2)
		root.setAttribute('a', 1)
		root.setAttribute('a', 1)
		root.setAttribute('a', 1)
		assert(root.attributes.length, 2)
		try {
			var c = root.ownerDocument.createElement('c')
			c.setAttributeNode(root.attributes.item(0))
		} catch (e) {
			assert(e.code, 10)
			return
		}
		assert.fail('expected error but none was thrown')
	})

	it('can properly set ns attribute', () => {
		var root = new DOMParser().parseFromString(
			"<xml xmlns:a='a' xmlns:b='b' xmlns='e'><child/></xml>",
			'text/xml'
		).documentElement
		var child = root.firstChild
		child.setAttributeNS('a', 'a:a', '1')
		child.setAttributeNS('b', 'b:b', '2')
		child.setAttributeNS('b', 'b:a', '1')
		assert(child.attributes.length, 3, 'after adding 3', child)
		child.setAttribute('a', 1)
		child.setAttributeNS('b', 'b:b', '2')
		assert(child.attributes.length, 4, 'after adding 4 and one with namespace')
		try {
			var c = root.ownerDocument.createElement('c')
			c.setAttributeNodeNS(root.attributes.item(0))
		} catch (e) {
			assert(e.code, 10, 'wrong error code')
			return
		}
		assert.fail('expected error but none was thrown')
	})

	it('can properly override attribute', () => {
		var root = new DOMParser().parseFromString(
			"<xml xmlns:a='a' xmlns:b='b' xmlns='e'><child/></xml>",
			'text/xml'
		).documentElement
		root.setAttributeNS('a', 'a:a', '1')
		assert(root.attributes.length, 4)
		//not standart
		//    	root.firstChild.setAttributeNode(root.attributes[0]);
		//    	assert(root.attributes.length, 0);
	})

	it('properly supports attribute namespace', () => {
		var root = new DOMParser().parseFromString(
			"<xml xmlns:a='a' xmlns:b='b' a:b='e'></xml>",
			'text/xml'
		).documentElement
		assert(root.getAttributeNS('a', 'b'), 'e')
	})

	xit('can properly override ns attribute', () => {})

	xit('can properly set existed attribute', () => {})

	xit('can properly set document existed attribute', () => {})
})
