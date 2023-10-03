'use strict';

const { DOMParser, DOMImplementation, XMLSerializer } = require('../../lib');
const { MIME_TYPE, NAMESPACE } = require('../../lib/conventions');
const { Element, DOMException } = require('../../lib/dom');

describe('documentElement', () => {
	test('can properly append exist child', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" id="root">' +
				'<child1 id="a1" title="1"><child11 id="a2"  title="2"/></child1>' +
				'<child2 id="a1"   title="3"/><child3 id="a1"   title="3"/></xml>',
			MIME_TYPE.XML_TEXT
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

	test('can properly append exist other child', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" id="root">' +
				'<child1 id="a1" title="1"><child11 id="a2"  title="2"><child/></child11></child1>' +
				'<child2 id="a1"   title="3"/><child3 id="a1"   title="3"/></xml>',
			MIME_TYPE.XML_TEXT
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
		const doc3 = new DOMParser().parseFromString(str2, MIME_TYPE.XML_TEXT);
		doc3.documentElement.firstChild.appendChild(doc3.documentElement.lastChild);
		const str3 = new XMLSerializer().serializeToString(doc3);
		expect(str1).toBe(str3);
	});

	test('can properly set textContent', () => {
		const doc = new DOMParser().parseFromString('<test><a/><b><c/></b></test>', MIME_TYPE.XML_TEXT);
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

	test('appendElement and removeElement', () => {
		const dom = new DOMParser().parseFromString(`<root><A/><B/><C/></root>`, MIME_TYPE.XML_TEXT);
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
	describe('getAttribute', () => {
		const doc = new DOMImplementation().createDocument(null, 'xml');
		expect(doc.documentElement.getAttribute('no')).toBeNull();
	});
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

			const attr = doc.documentElement.getAttributeNode(ATTR_MIXED_CASE);
			doc.documentElement.setAttribute(ATTR_MIXED_CASE, VALUE + VALUE);
			expect(doc.documentElement.getAttributeNode(ATTR_MIXED_CASE)).toBe(attr);
			expect(doc.documentElement.getAttribute(ATTR_MIXED_CASE)).toBe(VALUE + VALUE);
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

			const attr = doc.documentElement.getAttributeNode(ATTR_MIXED_CASE);
			doc.documentElement.setAttribute(ATTR_LOWER_CASE, VALUE + VALUE);
			expect(doc.documentElement.getAttributeNode(ATTR_LOWER_CASE)).toBe(attr);
			expect(doc.documentElement.getAttribute(ATTR_MIXED_CASE)).toBe(VALUE + VALUE);
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
	describe('setAttributeNS', () => {
		test('can properly set ns attribute', () => {
			const root = new DOMParser().parseFromString(
				"<xml xmlns:a='a' xmlns:b='b' xmlns='e'><child/></xml>",
				MIME_TYPE.XML_TEXT
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

		test('can properly override attribute', () => {
			const root = new DOMParser().parseFromString(
				"<xml xmlns:a='a' xmlns:b='b' xmlns='e'><child/></xml>",
				MIME_TYPE.XML_TEXT
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

		test('properly supports attribute namespace', () => {
			const root = new DOMParser().parseFromString(
				"<xml xmlns:a='a' xmlns:b='b' a:b='e'></xml>",
				MIME_TYPE.XML_TEXT
			).documentElement;
			expect(root.getAttributeNS('a', 'b')).toBe('e');
		});
	});
	describe('element traversal', () => {
		it('initialization', () => {
			const doc = new DOMParser().parseFromString(`<A/>`)
			const aElement = doc.firstChild

			expect(aElement.childElementCount).toBe(0)
			expect(aElement.firstElementChild).toBeNull()
			expect(aElement.lastElementChild).toBeNull()
			expect(aElement.previousElementSibling).toBeNull()
			expect(aElement.nextElementSibling).toBeNull()
		})

		it('append one element and remove', () => {
			const doc = new DOMParser().parseFromString(`<A></A>`)
			const aElement = doc.firstChild
			const bElement = doc.createElement('B')
			aElement.appendChild(bElement)

			expect(aElement.childElementCount).toBe(1)
			expect(aElement.firstElementChild === bElement).toBe(true)
			expect(aElement.lastElementChild === bElement).toBe(true)
			expect(bElement.previousElementSibling).toBeNull()
			expect(bElement.nextElementSibling).toBeNull()

			aElement.removeChild(bElement)

			expect(aElement.childElementCount).toBe(0)
			expect(aElement.firstElementChild).toBeNull()
			expect(aElement.lastElementChild).toBeNull()
		})

		it('append second element at the end and remove it', () => {
			const doc = new DOMParser().parseFromString(`<A><B/></A>`)
			const aElement = doc.firstChild
			const bElement = doc.firstChild.firstChild

			const cElement = doc.createElement('C')
			aElement.appendChild(cElement)

			expect(aElement.childElementCount).toBe(2)
			expect(aElement.firstElementChild === bElement).toBe(true)
			expect(aElement.lastElementChild === cElement).toBe(true)
			expect(bElement.previousElementSibling).toBeNull()
			expect(bElement.nextElementSibling === cElement).toBe(true)
			expect(cElement.previousElementSibling === bElement).toBe(true)
			expect(cElement.nextElementSibling).toBeNull()

			aElement.removeChild(cElement)

			expect(aElement.childElementCount).toBe(1)
			expect(aElement.firstElementChild === bElement).toBe(true)
			expect(aElement.lastElementChild === bElement).toBe(true)
			expect(bElement.previousElementSibling).toBeNull()
			expect(bElement.nextElementSibling).toBeNull()
			expect(cElement.previousElementSibling).toBeNull()
			expect(cElement.nextElementSibling).toBeNull()
		})

		it('remove element between two siblings', () => {
			const doc = new DOMParser().parseFromString(`<A><B/><C/><D/></A>`)
			const aElement = doc.firstChild
			const bElement = doc.firstChild.firstChild
			const cElement = bElement.nextSibling
			const dElement = cElement.nextSibling

			aElement.removeChild(cElement)
			expect(bElement.previousElementSibling).toBeNull()
			expect(bElement.nextElementSibling === dElement).toBe(true)
			expect(dElement.previousElementSibling === bElement).toBe(true)
			expect(dElement.nextElementSibling).toBeNull()
		})
	})
});
