'use strict';
const { describe, it, expect } = require('@jest/globals');
const { Attr, NamedNodeMap } = require('../../lib/dom');
const { DOMException } = require('../../lib/errors');

const HTML_OWNER_ELEMENT = { _isInHTMLDocumentAndNamespace: () => true };
const XML_OWNER_ELEMENT = { _isInHTMLDocumentAndNamespace: () => false };

describe('NamedNodeMap', () => {
	describe('getNamedItem', () => {
		test('should return null when no attribute is found', () => {
			const it = new NamedNodeMap();
			expect(it.getNamedItem('a')).toBeNull();
		});
		test('should return first matching attr by nodeName', () => {
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
		test('should return first matching attr by lowercase nodeName in HTML', () => {
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
		test('should return null for attr with different case nodeName in XML', () => {
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
		test('should return null when no attribute is found', () => {
			const it = new NamedNodeMap();
			expect(it.getNamedItemNS(null, 'a')).toBeNull();
			expect(it.getNamedItemNS('', 'a')).toBeNull();
			expect(it.getNamedItemNS('x', 'a')).toBeNull();
		});
		test('should return first matching attr by nodeName', () => {
			const it = new NamedNodeMap();
			const first = new Attr();
			first.localName = 'first';
			it[0] = first;

			const second = new Attr();
			second.localName = 'second';
			it[1] = second;

			const third = new Attr();
			third.localName = second.localName;
			it[2] = third;
			it.length = 3;
			expect(it.getNamedItemNS(null, second.localName)).toBe(second);
			expect(it.getNamedItemNS('', second.localName)).toBe(second);
		});
		test('should return first matching attr by nodeName and namespaceURI', () => {
			const it = new NamedNodeMap();
			const first = new Attr();
			first.localName = 'first';
			it[0] = first;

			const second = new Attr();
			second.namespaceURI = 'A';
			second.localName = 'second';
			it[1] = second;

			const third = new Attr();
			third.namespaceURI = 'B';
			third.localName = second.localName;
			it[2] = third;
			it.length = 3;
			expect(it.getNamedItemNS('A', second.localName)).toBe(second);
			expect(it.getNamedItemNS('B', second.localName)).toBe(third);
		});
		test('should return null for attr with different case nodeName', () => {
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
	['setNamedItem', 'setNamedItemNS'].forEach((setNamedItemMethod) => {
		describe(setNamedItemMethod, () => {
			test('should throw error if attr.ownerElement is set and not the same', () => {
				const it = new NamedNodeMap();
				it._ownerElement = {};
				const attr = new Attr();
				attr.ownerElement = {};

				expect(() => it[setNamedItemMethod](attr)).toThrow(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
			});
			test('should only add the same attribute (instance) once', () => {
				const it = new NamedNodeMap();
				it._ownerElement = XML_OWNER_ELEMENT;
				const attr = new Attr();
				attr.nodeName = attr.localName = 'attr';
				attr.ownerElement = it._ownerElement;

				expect(it[setNamedItemMethod](attr)).toBeNull();
				expect(it[0]).toBe(attr);
				expect(it.length).toBe(1);

				const namedItem = it[setNamedItemMethod](attr);

				expect(it.length).toBe(1);
				expect(namedItem).toBe(attr);
			});
			test('should add the attribute with different case in nodeName', () => {
				const it = new NamedNodeMap();
				it._ownerElement = {};
				const attr = new Attr();
				attr.nodeName = attr.localName = 'attr';
				attr.ownerElement = it._ownerElement;

				expect(it[setNamedItemMethod](attr)).toBeNull();
				expect(it[0]).toBe(attr);
				expect(it.length).toBe(1);

				const upper = new Attr();
				upper.nodeName = attr.nodeName.toUpperCase();

				expect(it[setNamedItemMethod](upper)).toBeNull();
				expect(it[0]).toBe(attr);
				expect(it[1]).toBe(upper);
				expect(it.length).toBe(2);
			});
		});
	});

	describe('removeNamedItem', () => {
		test('should throw when no attribute is found', () => {
			const it = new NamedNodeMap();
			expect(() => it.removeNamedItem('a')).toThrow(new DOMException(DOMException.NOT_FOUND_ERR, 'a'));
		});
		test('should remove first matching attr by nodeName', () => {
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
			expect(it.removeNamedItem(second.nodeName)).toBe(second);
			expect(it[0]).toBe(first);
			expect(it[1]).toBe(third);
			expect(it.length).toBe(2);
		});
		test('should remove first matching attr by lowercase nodeName in HTML', () => {
			const it = new NamedNodeMap();
			it._ownerElement = HTML_OWNER_ELEMENT;
			const first = new Attr();
			first.nodeName = 'first';
			it[0] = first;
			const second = new Attr();
			second.nodeName = 'second';
			second.ownerElement = it._ownerElement;
			it[1] = second;
			const third = new Attr();
			third.nodeName = second.nodeName;
			it[2] = third;
			it.length = 3;
			expect(it.removeNamedItem(second.nodeName.toUpperCase())).toBe(second);
			expect(second.ownerElement).toBeNull();
			expect(it[0]).toBe(first);
			expect(it[1]).toBe(third);
			expect(it.length).toBe(2);
		});
		test('should throw for attr with different case nodeName in XML', () => {
			const it = new NamedNodeMap();
			it._ownerElement = XML_OWNER_ELEMENT;
			const first = new Attr();
			first.nodeName = 'first';
			it[0] = first;
			const second = new Attr();
			second.nodeName = 'second';
			it[1] = second;
			it.length = 2;
			const localName = second.nodeName.toUpperCase();
			expect(() => it.removeNamedItem(localName)).toThrow(new DOMException(DOMException.NOT_FOUND_ERR, localName));
		});
	});
	describe('removeNamedItemNS', () => {
		test('should throw when no attribute is found', () => {
			const it = new NamedNodeMap();
			expect(() => it.removeNamedItemNS(null, 'a')).toThrow(new DOMException(DOMException.NOT_FOUND_ERR, 'a'));
			expect(() => it.removeNamedItemNS('', 'a')).toThrow(new DOMException(DOMException.NOT_FOUND_ERR, 'a'));
			expect(() => it.removeNamedItemNS('x', 'a')).toThrow(new DOMException(DOMException.NOT_FOUND_ERR, 'x : a'));
		});
		test('should remove first matching attr by nodeName', () => {
			const it = new NamedNodeMap();
			it._ownerElement = XML_OWNER_ELEMENT;
			const first = new Attr();
			first.localName = 'first';
			it[0] = first;

			const second = new Attr();
			second.localName = 'second';
			second.ownerElement = it._ownerElement;
			it[1] = second;

			const third = new Attr();
			third.localName = second.localName;
			third.ownerElement = it._ownerElement;
			it[2] = third;
			it.length = 3;
			expect(it.removeNamedItemNS(null, second.localName)).toBe(second);
			expect(second.ownerElement).toBeNull();
			expect(it[0]).toBe(first);
			expect(it[1]).toBe(third);
			expect(it[2]).toBe(undefined);
			expect(it.length).toBe(2);
			expect(it.removeNamedItemNS('', second.localName)).toBe(third);
			expect(second.ownerElement).toBeNull();
			expect(it[0]).toBe(first);
			expect(it[1]).toBe(undefined);
			expect(it.length).toBe(1);
		});
		test('should throw for attr with different case nodeName', () => {
			const it = new NamedNodeMap();
			const first = new Attr();
			first.localName = 'first';
			it[0] = first;
			const second = new Attr();
			second.localName = 'second';
			it[1] = second;
			it.length = 2;
			const localName = second.localName.toUpperCase();
			expect(() => it.removeNamedItemNS(null, localName)).toThrow(new DOMException(DOMException.NOT_FOUND_ERR, localName));
		});
	});
});
