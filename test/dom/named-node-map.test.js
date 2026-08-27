'use strict';
const { describe, it, expect } = require('@jest/globals');
const { DOMImplementation, NamedNodeMap } = require('../../lib/dom');
const { DOMParser } = require('../../lib/dom-parser');
const { XMLSerializer } = require('../../lib');
const { DOMException } = require('../../lib/errors');

const doc = new DOMImplementation().createDocument(null, 'xml');

const HTML_OWNER_ELEMENT = { _isInHTMLDocumentAndNamespace: () => true };
const XML_OWNER_ELEMENT = { _isInHTMLDocumentAndNamespace: () => false };

describe('NamedNodeMap', () => {
	describe('Iterator', () => {
		test('should iterate over 3/3 items when using a for...of loop without interruption', () => {
			const it = new NamedNodeMap();
			const first = doc.createAttribute('first');
			it[0] = first;
			const second = doc.createAttribute('second');
			it[1] = second;
			const third = doc.createAttribute('third');
			it[2] = third;
			it.length = 3;

			let count = 0;
			for (const _item of it) {
				count++;
			}
			expect(count).toBe(it.length);
		});
		test('should iterate over 1/3 items when using a for...of loop and breaking after first iteration', () => {
			const it = new NamedNodeMap();
			const first = doc.createAttribute('first');
			it[0] = first;
			const second = doc.createAttribute('second');
			it[1] = second;
			const third = doc.createAttribute('third');
			it[2] = third;
			it.length = 3;

			let count = 0;
			for (const _item of it) {
				count++;
				break;
			}
			expect(count).toBe(1);
		});
		test('should iterate over 3/3 items when using two for...of loops subsequently', () => {
			const it = new NamedNodeMap();
			const first = doc.createAttribute('first');
			it[0] = first;
			const second = doc.createAttribute('second');
			it[1] = second;
			const third = doc.createAttribute('third');
			it[2] = third;
			it.length = 3;

			let firstCount = 0;
			for (const _item of it) {
				firstCount++;
			}
			let secondCount = 0;
			for (const _item of it) {
				secondCount++;
			}

			expect(firstCount).toBe(it.length);
			expect(secondCount).toBe(it.length);
		});
	});
	describe('getNamedItem', () => {
		test('should return null when no attribute is found', () => {
			const it = new NamedNodeMap();
			expect(it.getNamedItem('a')).toBeNull();
		});
		test('should return first matching attr by nodeName', () => {
			const it = new NamedNodeMap();
			const first = doc.createAttribute('first');
			it[0] = first;
			const second = doc.createAttribute('second');
			it[1] = second;
			const third = doc.createAttribute(second.nodeName);
			it[2] = third;
			it.length = 3;
			expect(it.getNamedItem(second.nodeName)).toBe(second);
		});
		test('should return first matching attr by lowercase nodeName in HTML', () => {
			const it = new NamedNodeMap();
			it._ownerElement = HTML_OWNER_ELEMENT;
			const first = doc.createAttribute('first');
			it[0] = first;
			const second = doc.createAttribute('second');
			it[1] = second;
			const third = doc.createAttribute(second.nodeName);
			it[2] = third;
			it.length = 3;
			expect(it.getNamedItem(second.nodeName.toUpperCase())).toBe(second);
		});
		test('should return null for attr with different case nodeName in XML', () => {
			const it = new NamedNodeMap();
			it._ownerElement = XML_OWNER_ELEMENT;
			const first = doc.createAttribute('first');
			it[0] = first;
			const second = doc.createAttribute('second');
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
			const first = doc.createAttribute('first');
			it[0] = first;

			const second = doc.createAttribute('second');
			it[1] = second;

			const third = doc.createAttribute(second.localName);
			it[2] = third;
			it.length = 3;
			expect(it.getNamedItemNS(null, second.localName)).toBe(second);
			expect(it.getNamedItemNS('', second.localName)).toBe(second);
		});
		test('should return first matching attr by nodeName and namespaceURI', () => {
			const it = new NamedNodeMap();
			const first = doc.createAttribute('first');
			it[0] = first;

			const second = doc.createAttribute('second');
			second.namespaceURI = 'A';
			it[1] = second;

			const third = doc.createAttribute(second.localName);
			third.namespaceURI = 'B';
			it[2] = third;
			it.length = 3;
			expect(it.getNamedItemNS('A', second.localName)).toBe(second);
			expect(it.getNamedItemNS('B', second.localName)).toBe(third);
		});
		test('should return null for attr with different case nodeName', () => {
			const it = new NamedNodeMap();
			const first = doc.createAttribute('first');
			it[0] = first;
			const second = doc.createAttribute('second');
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
				const attr = doc.createAttribute('attr');
				attr.ownerElement = {};

				expect(() => it[setNamedItemMethod](attr)).toThrow(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
			});
			test('should only add the same attribute (instance) once', () => {
				const it = new NamedNodeMap();
				it._ownerElement = XML_OWNER_ELEMENT;
				const attr = doc.createAttribute('attr');
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
				const attr = doc.createAttribute('attr');
				attr.ownerElement = it._ownerElement;

				expect(it[setNamedItemMethod](attr)).toBeNull();
				expect(it[0]).toBe(attr);
				expect(it.length).toBe(1);

				const upper = doc.createAttribute(attr.nodeName.toUpperCase());

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
			const first = doc.createAttribute('first');
			it[0] = first;
			const second = doc.createAttribute('second');
			it[1] = second;
			const third = doc.createAttribute(second.nodeName);
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
			const first = doc.createAttribute('first');
			it[0] = first;
			const second = doc.createAttribute('second');
			second.ownerElement = it._ownerElement;
			it[1] = second;
			const third = doc.createAttribute(second.nodeName);
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
			const first = doc.createAttribute('first');
			it[0] = first;
			const second = doc.createAttribute('second');
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
			const first = doc.createAttribute('first');
			it[0] = first;

			const second = doc.createAttribute('second');
			second.ownerElement = it._ownerElement;
			it[1] = second;

			const third = doc.createAttribute(second.localName);
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
			const first = doc.createAttribute('first');
			it[0] = first;
			const second = doc.createAttribute('second');
			it[1] = second;
			it.length = 2;
			const localName = second.localName.toUpperCase();
			expect(() => it.removeNamedItemNS(null, localName)).toThrow(new DOMException(DOMException.NOT_FOUND_ERR, localName));
		});
	});

	// Characterization of the parse/DOM attribute de-duplication behaviour that the
	// O(M^2)->O(M) index refactor must preserve byte-for-byte (GHSA parse-dedup).
	// These assert current behaviour and stay green across the refactor.
	describe('de-duplication behaviour (characterization)', () => {
		const xmlDoc = new DOMImplementation().createDocument(null, 'root');

		test('a duplicate (namespace, localName) keeps the first position and takes the last value', () => {
			const el = xmlDoc.createElement('e');
			const x1 = xmlDoc.createAttribute('x');
			x1.value = '1';
			el.setAttributeNode(x1);
			const y = xmlDoc.createAttribute('y');
			y.value = '9';
			el.setAttributeNode(y);
			const x2 = xmlDoc.createAttribute('x');
			x2.value = '2';
			const returned = el.setAttributeNode(x2);

			expect(returned).toBe(x1); // the replaced attribute is returned
			expect(el.attributes.length).toBe(2);
			// last value wins, first occurrence's position kept (x before y)
			expect(new XMLSerializer().serializeToString(el)).toStrictEqual('<e x="2" y="9"/>');
		});

		test('duplicate qualified names in different namespaces are kept distinct', () => {
			const el = xmlDoc.createElement('e2');
			const p = xmlDoc.createAttributeNS('P', 'p:x');
			p.value = '1';
			el.setAttributeNode(p);
			const q = xmlDoc.createAttributeNS('Q', 'q:x');
			q.value = '2';
			el.setAttributeNode(q);

			expect(el.attributes.length).toBe(2);
			expect(el.attributes.getNamedItemNS('P', 'x')).toBe(p);
			expect(el.attributes.getNamedItemNS('Q', 'x')).toBe(q);
			expect(new XMLSerializer().serializeToString(el)).toStrictEqual('<e2 xmlns:p="P" p:x="1" xmlns:q="Q" q:x="2"/>');
		});

		test('a null namespace and an empty-string namespace address the same attribute', () => {
			const el = xmlDoc.createElement('e3');
			const z = xmlDoc.createAttribute('z');
			z.value = '1';
			el.setAttributeNode(z);

			expect(el.attributes.getNamedItemNS(null, 'z')).toBe(z);
			expect(el.attributes.getNamedItemNS('', 'z')).toBe(z);
		});

		test('a real namespace equal to the string "null" does not collide with the null namespace', () => {
			const el = xmlDoc.createElement('e4');
			const noNs = xmlDoc.createAttribute('x');
			noNs.value = '1';
			el.setAttributeNode(noNs);
			const strNull = xmlDoc.createAttributeNS('null', 'p:x');
			strNull.value = '2';
			el.setAttributeNode(strNull);

			// distinct attributes: null namespace vs the literal namespace URI "null"
			expect(el.attributes.length).toBe(2);
			expect(el.attributes.getNamedItemNS(null, 'x')).toBe(noNs);
			expect(el.attributes.getNamedItemNS('null', 'x')).toBe(strNull);
		});

		test('many distinct attributes parse and serialize in source order', () => {
			const names = Array.from({ length: 50 }, (_, i) => 'a' + i);
			const source = '<r ' + names.map((n) => n + '="x"').join(' ') + '/>';
			const el = new DOMParser().parseFromString(source, 'text/xml').documentElement;

			expect(el.attributes.length).toBe(names.length);
			expect(new XMLSerializer().serializeToString(el)).toStrictEqual(source);
		});
	});
});
