'use strict';

const { describe, expect, test } = require('@jest/globals');
const { getTestParser } = require('../get-test-parser');
const { DOMParser, DOMImplementation, XMLSerializer } = require('../../lib');
const { MIME_TYPE, NAMESPACE } = require('../../lib/conventions');
const { Element, Node } = require('../../lib/dom');
const { DOMException, DOMExceptionName } = require('../../lib/errors');
const { expectDOMException } = require('../errors/expectDOMException');

describe('documentElement', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new Element()).toThrow(TypeError);
		});
	});
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

	test('should throw DOMException when trying to append a doctype', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, 'root');
		const docType = impl.createDocumentType('dt');
		expect(docType.nodeType).toBe(Node.DOCUMENT_TYPE_NODE);
		expectDOMException(
			() => doc.documentElement.appendChild(docType),
			DOMExceptionName.HierarchyRequestError,
			'node type 10 for parent node type 1'
		);
	});

	xit('nested append failed', () => {});

	xit('self append failed', () => {});
});

const INPUT = (first = '', second = '', third = '', fourth = '') => `
<html >
	<body id='body'>
		<p id='p1' class=' quote first   odd ${first} '>Lorem ipsum</p>
		<p id='p2' class=' quote second  even ${second} '>Lorem ipsum</p>
		<p id='p3' class=' quote third   odd ${third} '>Lorem ipsum</p>
		<p id='p4' class=' quote fourth  even ${fourth} '>Lorem ipsum</p>
	</body>
</html>
`;

/**
 * Whitespace that can be part of classnames.
 * Some characters (like `\u2028`) will be normalized when parsing,
 * but they can still be added to the dom after parsing.
 *
 * @see https://www.w3.org/TR/html52/infrastructure.html#set-of-space-separated-tokens
 * @see {@link normalizeLineEndings}
 * @see https://www.w3.org/TR/xml11/#sec-line-ends
 */
const NON_HTML_WHITESPACE =
	'\v\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff';

describe('Element', () => {
	const ATTR_MIXED_CASE = 'AttR';
	const ATTR_LOWER_CASE = 'attr';
	const VALUE = '2039e2dk';
	describe('constructor', () => {
		const element = new DOMImplementation().createDocument(null, 'doc').documentElement;
		expect(element._nsMap).not.toHaveProperty('prototype');
		expect(element._nsMap).not.toHaveProperty('__proto__');
	});
	describe('getAttribute', () => {
		const doc = new DOMImplementation().createDocument(null, 'xml');
		expect(doc.documentElement.getAttribute('no')).toBeNull();
	});
	describe('getElementsByClassName', () => {
		test('should be able to resolve [] as a class name', () => {
			const doc = getTestParser().parser.parseFromString(INPUT('[]'), MIME_TYPE.XML_TEXT);
			const body = doc.getElementsByTagName('body')[0];
			expect(body.getElementsByClassName('[]')).toHaveLength(1);
		});
		test('should be able to resolve [ as a class name', () => {
			const doc = getTestParser().parser.parseFromString(INPUT('['), MIME_TYPE.XML_TEXT);
			const body = doc.getElementsByTagName('body')[0];
			expect(body.getElementsByClassName('[')).toHaveLength(1);
		});
		test('should be able to resolve multiple class names in a different order', () => {
			const doc = getTestParser().parser.parseFromString(INPUT(), MIME_TYPE.XML_TEXT);
			const body = doc.getElementsByTagName('body')[0];
			expect(body.getElementsByClassName('odd quote')).toHaveLength(2);
		});
		test('should be able to resolve non html whitespace as classname', () => {
			const doc = getTestParser().parser.parseFromString(INPUT(), MIME_TYPE.XML_TEXT);
			const body = doc.getElementsByTagName('body')[0];
			const firstP = body.getElementsByTagName('p')[0];
			expect(firstP).toBeDefined();

			firstP.setAttribute('class', firstP.getAttribute('class') + ' ' + NON_HTML_WHITESPACE);

			expect(body.getElementsByClassName(`quote ${NON_HTML_WHITESPACE}`)).toHaveLength(1);
		});
		test('should not allow regular expression in argument', () => {
			const search = '(((a||||)+)+)+';
			const matching = 'aaaaa';
			expect(new RegExp(search).test(matching)).toBe(true);

			const doc = getTestParser().parser.parseFromString(INPUT(search, matching, search), MIME_TYPE.XML_TEXT);
			const body = doc.getElementsByTagName('body')[0];

			expect(body.getElementsByClassName(search)).toHaveLength(2);
		});
		test('should return an empty collection when no class names or are passed', () => {
			const doc = getTestParser().parser.parseFromString(INPUT(), MIME_TYPE.XML_TEXT);
			const body = doc.getElementsByTagName('body')[0];

			expect(body.getElementsByClassName('')).toHaveLength(0);
		});
		test('should return only children not the element itself', () => {
			const doc = getTestParser().parser.parseFromString(INPUT(), MIME_TYPE.XML_TEXT);
			const body = doc.getElementsByTagName('body')[0];
			body.setAttribute('class', 'quote');

			expect(body.getElementsByClassName('quote')).toHaveLength(4);
		});
		test('should return an empty collection when only spaces are passed', () => {
			const doc = getTestParser().parser.parseFromString(
				INPUT(' \f\n\r\t', ' \f\n\r\t', ' \f\n\r\t', ' \f\n\r\t'),
				MIME_TYPE.XML_TEXT
			);
			const body = doc.getElementsByTagName('body')[0];

			expect(body.getElementsByClassName(' \f\n\r\t')).toHaveLength(0);
		});
		test('should return only the case sensitive matching names', () => {
			const MIXED_CASES = ['AAA', 'AAa', 'AaA', 'aAA'];
			const doc = getTestParser().parser.parseFromString(INPUT(...MIXED_CASES), MIME_TYPE.XML_TEXT);

			MIXED_CASES.forEach((className) => {
				expect(doc.getElementsByClassName(className)).toHaveLength(1);
			});
		});
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
		test('should throw InvalidCharacterError DOMException if qualifiedName does not match QName', () => {
			const doc = new DOMImplementation().createDocument(null, 'doc');
			expectDOMException(() => doc.documentElement.setAttributeNS(null, '123', ''), DOMExceptionName.InvalidCharacterError);
		});
		test('should throw NamespaceError DOMException if prefix is present but namespace is null', () => {
			const doc = new DOMImplementation().createDocument(null, 'doc');
			expectDOMException(
				() => doc.documentElement.setAttributeNS(null, 'prefix:name', ''),
				DOMExceptionName.NamespaceError,
				'namespace is null'
			);
		});
		test('should throw NamespaceError DOMException if prefix is "xml" but namespaceUri is not matching', () => {
			const doc = new DOMImplementation().createDocument(null, 'doc');
			expectDOMException(
				() => doc.documentElement.setAttributeNS('unexpected', 'xml:name', ''),
				DOMExceptionName.NamespaceError,
				'namespace is not the XML namespace'
			);
		});
		test('should throw NamespaceError DOMException if prefix is "xmlns" but namespaceUri is not matching', () => {
			const doc = new DOMImplementation().createDocument(null, 'doc');
			expectDOMException(
				() => doc.documentElement.setAttributeNS('unexpected', 'xmlns:name', ''),
				DOMExceptionName.NamespaceError,
				'namespace is not the XMLNS namespace'
			);
		});
		test('should throw NamespaceError DOMException if qualifiedName is "xmlns" but namespaceUri is not matching', () => {
			const doc = new DOMImplementation().createDocument(null, 'doc');
			expectDOMException(
				() => doc.documentElement.setAttributeNS('unexpected', 'xmlns', ''),
				DOMExceptionName.NamespaceError,
				'namespace is not the XMLNS namespace'
			);
		});
		test('should throw NamespaceError DOMException if it is the xmlns namespace but prefix is not xmlns', () => {
			const doc = new DOMImplementation().createDocument(null, 'doc');
			expectDOMException(
				() => doc.documentElement.setAttributeNS(NAMESPACE.XMLNS, 'prefix:abc', ''),
				DOMExceptionName.NamespaceError,
				'namespace is the XMLNS namespace'
			);
		});
		test('should throw NamespaceError DOMException if it is the xmlns namespace but qualifiedName is not xmlns', () => {
			const doc = new DOMImplementation().createDocument(null, 'doc');
			expectDOMException(
				() => doc.documentElement.setAttributeNS(NAMESPACE.XMLNS, 'abc', ''),
				DOMExceptionName.NamespaceError,
				'namespace is the XMLNS namespace'
			);
		});
	});
});
