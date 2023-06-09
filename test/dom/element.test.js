'use strict';

const { DOMParser, DOMImplementation, XMLSerializer } = require('../../lib');
const { MIME_TYPE, NAMESPACE } = require('../../lib/conventions');
const { Element } = require('../../lib/dom');

describe('documentElement', () => {
	it('can properly append exist child', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" id="root">' +
				'<child1 id="a1" title="1"><child11 id="a2"  title="2"/></child1>' +
				'<child2 id="a1"   title="3"/><child3 id="a1"   title="3"/></xml>',
			'text/xml'
		);

		const doc1 = doc;
		const str1 = new XMLSerializer().serializeToString(doc);
		const doc2 = doc1.cloneNode(true);
		const doc3 = doc1.cloneNode(true);
		const doc4 = doc1.cloneNode(true);

		doc3.documentElement.appendChild(doc3.documentElement.lastChild);
		doc4.documentElement.appendChild(doc4.documentElement.firstChild);

		const str2 = new XMLSerializer().serializeToString(doc2);
		const str3 = new XMLSerializer().serializeToString(doc3);
		const str4 = new XMLSerializer().serializeToString(doc4);
		expect(str1).toBe(str2);
		expect(str2).toBe(str3);
		expect(str3).not.toBe(str4);
		expect(str3.length).toBe(str4.length);
	});

	it('can properly append exist other child', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" id="root">' +
				'<child1 id="a1" title="1"><child11 id="a2"  title="2"><child/></child11></child1>' +
				'<child2 id="a1"   title="3"/><child3 id="a1"   title="3"/></xml>',
			'text/xml'
		);

		const doc1 = doc;
		const str1 = new XMLSerializer().serializeToString(doc);
		const doc2 = doc1.cloneNode(true);

		expect(doc2.documentElement.lastChild.childNodes).toHaveLength(0);
		doc2.documentElement.appendChild(doc2.documentElement.firstChild.firstChild);

		const str2 = new XMLSerializer().serializeToString(doc2);

		expect(doc2.documentElement.lastChild.childNodes).toHaveLength(1);
		expect(str1).not.toBe(str2);
		expect(str1).not.toHaveLength(str2.length);
		const doc3 = new DOMParser().parseFromString(str2, 'text/xml');
		doc3.documentElement.firstChild.appendChild(doc3.documentElement.lastChild);
		const str3 = new XMLSerializer().serializeToString(doc3);
		expect(str1).toBe(str3);
	});

	it('can properly set textContent', () => {
		const doc = new DOMParser().parseFromString('<test><a/><b><c/></b></test>');
		const a = doc.documentElement.firstChild;
		const b = a.nextSibling;
		a.textContent = 'hello';
		expect(doc.documentElement.toString()).toBe('<test><a>hello</a><b><c/></b></test>');
		b.textContent = 'there';
		expect(doc.documentElement.toString()).toBe('<test><a>hello</a><b>there</b></test>');
		b.textContent = '';
		expect(doc.documentElement.toString()).toBe('<test><a>hello</a><b/></test>');
		doc.documentElement.textContent = 'bye';
		expect(doc.documentElement.toString()).toBe('<test>bye</test>');
	});

	it('appendElement and removeElement', () => {
		const dom = new DOMParser().parseFromString(`<root><A/><B/><C/></root>`);
		const doc = dom.documentElement;
		const arr = [];
		while (doc.firstChild) {
			const node = doc.removeChild(doc.firstChild);
			arr.push(node);
			expect(node.parentNode).toBeNull();
			expect(node.previousSibling).toBeNull();
			expect(node.nextSibling).toBeNull();
			expect(node.ownerDocument).toBe(dom);
			expect(doc.firstChild).not.toBe(node);
			const expectedLength = 3 - arr.length;
			expect(doc.childNodes).toHaveLength(expectedLength);
			expect(doc.childNodes.item(expectedLength)).toBeNull();
		}
		expect(arr).toHaveLength(3);
		while (arr.length) {
			const node = arr.shift();
			expect(doc.appendChild(node)).toBe(node);
			expect(node.parentNode).toBe(doc);
			const expectedLength = 3 - arr.length;
			expect(doc.childNodes).toHaveLength(expectedLength);
			expect(doc.childNodes.item(expectedLength - 1)).toBe(node);
			if (expectedLength > 1) {
				expect(node.previousSibling).toBeInstanceOf(Element);
				expect(node.previousSibling.nextSibling).toBe(node);
			}
		}
		expect(doc.childNodes.toString()).toBe(`<A/><B/><C/>`);
	});

	xit('nested append failed', () => {});

	xit('self append failed', () => {});
});

describe('Element', () => {
	const ATTR_MIXED_CASE = 'AttR';
	const ATTR_LOWER_CASE = 'attr';
	const VALUE = '2039e2dk';
	describe('setAttribute', () => {
		test.each([null, NAMESPACE.HTML])('should set attribute as is in XML document with namespace %s', (ns) => {
			const doc = new DOMImplementation().createDocument(ns, 'xml');

			doc.documentElement.setAttribute(ATTR_MIXED_CASE, VALUE);

			expect(doc.documentElement.attributes).toHaveLength(1);
			expect(doc.documentElement.attributes.item(0)).toMatchObject({
				name: ATTR_MIXED_CASE,
				value: VALUE,
			});
			expect(doc.documentElement.hasAttribute(ATTR_MIXED_CASE)).toBe(true);
			expect(doc.documentElement.hasAttribute(ATTR_LOWER_CASE)).toBe(false);
		});
		test('should set attribute lower cased in HTML document', () => {
			const doc = new DOMImplementation().createHTMLDocument();

			doc.documentElement.setAttribute(ATTR_MIXED_CASE, VALUE);

			expect(doc.documentElement.attributes).toHaveLength(1);
			expect(doc.documentElement.attributes.item(0)).toMatchObject({
				name: ATTR_LOWER_CASE,
				value: VALUE,
			});
			// the attribute is accessible with the lower cased name
			expect(doc.documentElement.hasAttribute(ATTR_LOWER_CASE)).toBe(true);
			// and with the original name (and any other one that is the same lower case name)
			expect(doc.documentElement.hasAttribute(ATTR_MIXED_CASE)).toBe(true);
			// the value is the same for "both" attribute names
			expect(doc.documentElement.getAttribute(ATTR_MIXED_CASE)).toBe(doc.documentElement.getAttribute(ATTR_LOWER_CASE));
			// since it's the same node it resolves to
			expect(doc.documentElement.getAttributeNode(ATTR_MIXED_CASE)).toBe(doc.documentElement.getAttributeNode(ATTR_LOWER_CASE));
		});
		test('should set attribute as is in HTML document with different namespace', () => {
			const doc = new DOMImplementation().createHTMLDocument();
			const nameSpacedElement = doc.createElementNS(NAMESPACE.SVG, 'svg');
			expect(nameSpacedElement.namespaceURI).toBe(NAMESPACE.SVG);

			nameSpacedElement.setAttribute(ATTR_MIXED_CASE, VALUE);

			expect(nameSpacedElement.attributes).toHaveLength(1);
			expect(nameSpacedElement.attributes.item(0)).toMatchObject({
				name: ATTR_MIXED_CASE,
				value: VALUE,
			});
			expect(nameSpacedElement.hasAttribute(ATTR_MIXED_CASE)).toBe(true);
			expect(doc.documentElement.hasAttribute(ATTR_LOWER_CASE)).toBe(false);
		});
	});
});
