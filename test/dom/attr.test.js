'use strict';
const { DOMParser, XMLSerializer } = require('../../lib');
const { DOMException } = require('../../lib/dom');

describe('XML attrs', () => {
	it('can properly set ns attribute', () => {
		const root = new DOMParser().parseFromString(
			"<xml xmlns:a='a' xmlns:b='b' xmlns='e'><child/></xml>",
			'text/xml'
		).documentElement;

		const child = root.firstChild;
		child.setAttributeNS('a', 'a:a', 'a:a');
		child.setAttributeNS('b', 'b:b', 'b:b');
		child.setAttributeNS('b', 'b:a', 'b:a');
		const attrB = child.getAttributeNodeNS('b', 'b');
		expect(attrB).not.toBeNull();
		expect(child.getAttributeNS('b', 'b')).toBe('b:b');
		expect(child.attributes.length).toBe(3);
		child.setAttribute('a', 1);
		child.setAttributeNS('b', 'b:b', 'b:b-updated');
		expect(child.getAttributeNS('b', 'b')).toBe('b:b-updated');
		expect(child.getAttributeNodeNS('b', 'b')).toBe(attrB);
		expect(child.attributes.length).toBe(4);

		const c = root.ownerDocument.createElement('c');
		expect(() => {
			c.setAttributeNodeNS(root.attributes.item(0));
		}).toThrow(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
	});

	it('can properly override attribute', () => {
		const root = new DOMParser().parseFromString(
			"<xml xmlns:a='a' xmlns:b='b' xmlns='e'><child/></xml>",
			'text/xml'
		).documentElement;
		root.setAttributeNS('a', 'a:a', '1');
		const attr = root.getAttributeNode('a:a');
		expect(attr).not.toBeNull();
		// getAttributeNS and getAttributeNodeNS expect the localName, not the qualified one!
		expect(root.getAttributeNS('a', 'a')).toBe('1');
		expect(root.getAttributeNodeNS('a', 'a')).toBe(attr);
		root.setAttributeNS('a', 'a:a', '2');
		expect(root.getAttributeNS('a', 'a')).toBe('2');
		expect(root.getAttributeNodeNS('a', 'a')).toBe(attr);
		expect(root.attributes.length).toBe(4);
	});

	it('properly supports attribute namespace', () => {
		const root = new DOMParser().parseFromString("<xml xmlns:a='a' xmlns:b='b' a:b='e'></xml>", 'text/xml').documentElement;
		expect(root.getAttributeNS('a', 'b')).toBe('e');
	});

	xit('can properly override ns attribute', () => {});

	xit('can properly set existed attribute', () => {});

	xit('can properly set document existed attribute', () => {});
});
