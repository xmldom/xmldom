'use strict'
const { DOMParser } = require('../../lib/dom-parser')
const { DOMException } = require('../../lib/dom')

describe('XML attrs', () => {
	it('can properly set attribute', () => {
		const root = new DOMParser().parseFromString('<xml/>', 'text/xml')
			.documentElement
		root.setAttribute('a', '1')
		expect(root.attributes[0].localName).toBe('a')
		root.setAttribute('b', 2)
		root.setAttribute('a', 1)
		root.setAttribute('a', 1)
		root.setAttribute('a', 1)
		expect(root.attributes.length).toBe(2)
		expect(() => {
			const c = root.ownerDocument.createElement('c')
			c.setAttributeNode(root.attributes.item(0))
		}).toThrow(new DOMException(10))
	})

	it('can properly set ns attribute', () => {
		const root = new DOMParser().parseFromString(
			"<xml xmlns:a='a' xmlns:b='b' xmlns='e'><child/></xml>",
			'text/xml'
		).documentElement
		const child = root.firstChild
		child.setAttributeNS('a', 'a:a', '1')
		child.setAttributeNS('b', 'b:b', '2')
		child.setAttributeNS('b', 'b:a', '1')
		expect(child.attributes.length).toBe(3)
		child.setAttribute('a', 1)
		child.setAttributeNS('b', 'b:b', '2')
		expect(child.attributes.length).toBe(4)
		expect(() => {
			const c = root.ownerDocument.createElement('c')
			c.setAttributeNodeNS(root.attributes.item(0))
		}).toThrow(new DOMException(10))
	})

	it('can properly override attribute', () => {
		const root = new DOMParser().parseFromString(
			"<xml xmlns:a='a' xmlns:b='b' xmlns='e'><child/></xml>",
			'text/xml'
		).documentElement
		root.setAttributeNS('a', 'a:a', '1')
		expect(root.attributes.length).toBe(4)
		//not standart
		//    	root.firstChild.setAttributeNode(root.attributes[0]);
		//    	expect(root.attributes).toHaveLength(0);
	})

	it('properly supports attribute namespace', () => {
		const root = new DOMParser().parseFromString(
			"<xml xmlns:a='a' xmlns:b='b' a:b='e'></xml>",
			'text/xml'
		).documentElement
		expect(root.getAttributeNS('a', 'b')).toBe('e')
	})

	xit('can properly override ns attribute', () => {})

	xit('can properly set existed attribute', () => {})

	xit('can properly set document existed attribute', () => {})
})
