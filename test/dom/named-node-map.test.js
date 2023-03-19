'use strict';
const { describe, it, expect } = require('@jest/globals');
const { Attr, DOMException, NamedNodeMap } = require('../../lib/dom');

const HTML_OWNER_ELEMENT = { _isInHTMLDocumentAndNamespace: () => true };
const XML_OWNER_ELEMENT = { _isInHTMLDocumentAndNamespace: () => false };

describe('NamedNodeMap', () => {
	describe('getNamedItem', () => {
		it('should return null when no attribute is found', () => {
			const it = new NamedNodeMap();
			expect(it.getNamedItem('a')).toBeNull();
		});
		it('should return first matching attr by nodeName', () => {
			const it = new NamedNodeMap();
			const first = new Attr();
			first.nodeName = 'first';
			it[0] = first;
			const second = new Attr();
			second.nodeName = 'second';
			it[1] = second;
			const third = new Attr();
			third.nodeName = second.nodeName;
			it[2] = third;
			it.length = 3;
			expect(it.getNamedItem(second.nodeName)).toBe(second);
		});
		it('should return first matching attr by lowercase nodeName in HTML', () => {
			const it = new NamedNodeMap();
			it._ownerElement = HTML_OWNER_ELEMENT;
			const first = new Attr();
			first.nodeName = 'first';
			it[0] = first;
			const second = new Attr();
			second.nodeName = 'second';
			it[1] = second;
			const third = new Attr();
			third.nodeName = second.nodeName;
			it[2] = third;
			it.length = 3;
			expect(it.getNamedItem(second.nodeName.toUpperCase())).toBe(second);
		});
		it('should return null for attr with different case nodeName in XML', () => {
			const it = new NamedNodeMap();
			it._ownerElement = XML_OWNER_ELEMENT;
			const first = new Attr();
			first.nodeName = 'first';
			it[0] = first;
			const second = new Attr();
			second.nodeName = 'second';
			it[1] = second;
			it.length = 2;
			expect(it.getNamedItem(second.nodeName.toUpperCase())).toBeNull();
		});
	});
	describe('getNamedItemNS', () => {
		it('should return null when no attribute is found', () => {
			const it = new NamedNodeMap();
			expect(it.getNamedItemNS(null, 'a')).toBeNull();
			expect(it.getNamedItemNS('', 'a')).toBeNull();
			expect(it.getNamedItemNS('x', 'a')).toBeNull();
		});
		it('should return first matching attr by nodeName', () => {
			const it = new NamedNodeMap();
			const first = new Attr();
			first.localName = 'first';
			it[0] = first;

			const second = new Attr();
			// second.namespaceURI = null;
			second.localName = 'second';
			it[1] = second;

			const third = new Attr();
			third.localName = second.localName;
			it[2] = third;
			it.length = 3;
			expect(it.getNamedItemNS(null, second.localName)).toBe(second);
			expect(it.getNamedItemNS('', second.localName)).toBe(second);
		});
		it('should return null for attr with different case nodeName', () => {
			const it = new NamedNodeMap();
			const first = new Attr();
			first.localName = 'first';
			it[0] = first;
			const second = new Attr();
			second.localName = 'second';
			it[1] = second;
			it.length = 2;
			expect(it.getNamedItemNS(null, second.localName.toUpperCase())).toBeNull();
		});
	});
	describe('setNamedItem', () => {
		it('should throw error if attr.ownerElement is set and not the same', () => {
			const it = new NamedNodeMap();
			it._ownerElement = {};
			const attr = new Attr();
			attr.ownerElement = {};

			expect(() => it.setNamedItem(attr)).toThrow(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
		});
		it('should only add the same attribute (instance) once', () => {
			const it = new NamedNodeMap();
			it._ownerElement = XML_OWNER_ELEMENT;
			const attr = new Attr();
			attr.ownerElement = it._ownerElement;

			expect(it.setNamedItem(attr)).toBeNull();
			expect(it[0]).toBe(attr);
			expect(it.length).toBe(1);

			expect(it.setNamedItem(attr)).toBe(attr);
		});
		it('should replace the attribute in HTML according to lowercase node name', () => {
			const it = new NamedNodeMap();
			it._ownerElement = HTML_OWNER_ELEMENT;
			const attr = new Attr();
			attr.nodeName = 'attr';
			attr.ownerElement = it._ownerElement;

			expect(it.setNamedItem(attr)).toBeNull();
			expect(it[0]).toBe(attr);
			expect(it.length).toBe(1);

			const same = new Attr();
			same.nodeName = attr.nodeName.toUpperCase();

			expect(it.setNamedItem(same)).toBe(attr);
			expect(it[0]).toBe(same);
			expect(it.length).toBe(1);
		});
		it('should add the attribute with different case in nodeName in XML', () => {
			const it = new NamedNodeMap();
			it._ownerElement = XML_OWNER_ELEMENT;
			const attr = new Attr();
			attr.nodeName = 'attr';
			attr.ownerElement = it._ownerElement;

			expect(it.setNamedItem(attr)).toBeNull();
			expect(it[0]).toBe(attr);
			expect(it.length).toBe(1);

			const upper = new Attr();
			upper.nodeName = attr.nodeName.toUpperCase();

			expect(it.setNamedItem(upper)).toBeNull();
			expect(it[0]).toBe(attr);
			expect(it[1]).toBe(upper);
			expect(it.length).toBe(2);
		});
	});
	describe('setNamedItemNS', () => {
		it('should throw error if attr.ownerElement is set and not the same', () => {
			const it = new NamedNodeMap();
			it._ownerElement = {};
			const attr = new Attr();
			attr.ownerElement = {};

			expect(() => it.setNamedItemNS(attr)).toThrow(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
		});
		it('should only add the same attribute (instance) once', () => {
			const it = new NamedNodeMap();
			it._ownerElement = XML_OWNER_ELEMENT;
			const attr = new Attr();
			attr.ownerElement = it._ownerElement;

			expect(it.setNamedItemNS(attr)).toBeNull();
			expect(it[0]).toBe(attr);
			expect(it.length).toBe(1);

			expect(it.setNamedItemNS(attr)).toBe(attr);
		});
		it('should add the attribute with different case in localName in HTML', () => {
			const it = new NamedNodeMap();
			it._ownerElement = HTML_OWNER_ELEMENT;
			const attr = new Attr();
			attr.localName = 'attr';
			attr.ownerElement = it._ownerElement;

			expect(it.setNamedItemNS(attr)).toBeNull();
			expect(it[0]).toBe(attr);
			expect(it.length).toBe(1);

			const upper = new Attr();
			upper.localName = attr.localName.toUpperCase();

			expect(it.setNamedItemNS(upper)).toBeNull();
			expect(it[0]).toBe(attr);
			expect(it[1]).toBe(upper);
			expect(it.length).toBe(2);
		});
		it('should add the attribute with different case in localName in XML', () => {
			const it = new NamedNodeMap();
			it._ownerElement = XML_OWNER_ELEMENT;
			const attr = new Attr();
			attr.localName = 'attr';
			attr.ownerElement = it._ownerElement;

			expect(it.setNamedItemNS(attr)).toBeNull();
			expect(it[0]).toBe(attr);
			expect(it.length).toBe(1);

			const upper = new Attr();
			upper.localName = attr.localName.toUpperCase();

			expect(it.setNamedItemNS(upper)).toBeNull();
			expect(it[0]).toBe(attr);
			expect(it[1]).toBe(upper);
			expect(it.length).toBe(2);
		});
	});
});
