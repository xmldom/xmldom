'use strict';

const { describe, expect, test } = require('@jest/globals');
const { getTestParser } = require('../get-test-parser');
const { DOMImplementation, Document } = require('../../lib/dom');
const { NAMESPACE, MIME_TYPE } = require('../../lib/conventions');
const { DOMParser } = require('../../lib');
const { DOMExceptionName } = require('../../lib/errors');
const { expectDOMException } = require('../errors/expectDOMException');

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

describe('Document.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new Document()).toThrow(TypeError);
		});
	});
	describe('appendChild', () => {
		test('should throw HierarchyRequestError DOMException when trying to add a second element', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument(null, 'doc', impl.createDocumentType('firstDT'));
			expectDOMException(
				() => doc.appendChild(doc.createElement('secondRoot')),
				DOMExceptionName.HierarchyRequestError,
				'Only one element'
			);
		});
	});
	describe('getElementsByClassName', () => {
		test('should be able to resolve [] as a class name', () => {
			const doc = getTestParser().parser.parseFromString(INPUT('[]'), MIME_TYPE.XML_TEXT);
			expect(doc.getElementsByClassName('[]')).toHaveLength(1);
		});
		test('should be able to resolve [ as a class name', () => {
			const doc = getTestParser().parser.parseFromString(INPUT('['), MIME_TYPE.XML_TEXT);
			expect(doc.getElementsByClassName('[')).toHaveLength(1);
		});
		test('should be able to resolve multiple class names in a different order', () => {
			const doc = getTestParser().parser.parseFromString(INPUT(), MIME_TYPE.XML_TEXT);
			expect(doc.getElementsByClassName('odd quote')).toHaveLength(2);
		});
		test('should be able to resolve non html whitespace as classname', () => {
			const doc = getTestParser().parser.parseFromString(INPUT(), MIME_TYPE.XML_TEXT);
			const firstP = doc.documentElement.getElementsByTagName('body')[0].getElementsByTagName('p')[0];
			expect(firstP).toBeDefined();

			firstP.setAttribute('class', firstP.getAttribute('class') + ' ' + NON_HTML_WHITESPACE);

			expect(doc.getElementsByClassName(`quote ${NON_HTML_WHITESPACE}`)).toHaveLength(1);
		});
		test('should not allow regular expression in argument', () => {
			const search = '(((a||||)+)+)+';
			const matching = 'aaaaa';
			expect(new RegExp(search).test(matching)).toBe(true);

			const doc = getTestParser().parser.parseFromString(INPUT(search, matching, search), MIME_TYPE.XML_TEXT);

			expect(doc.getElementsByClassName(search)).toHaveLength(2);
		});
		test('should return an empty collection when no class names or are passed', () => {
			const doc = getTestParser().parser.parseFromString(INPUT(), MIME_TYPE.XML_TEXT);

			expect(doc.getElementsByClassName('')).toHaveLength(0);
		});
		test('should return an empty collection when only spaces are passed', () => {
			const doc = getTestParser().parser.parseFromString(
				INPUT(' \f\n\r\t', ' \f\n\r\t', ' \f\n\r\t', ' \f\n\r\t'),
				MIME_TYPE.XML_TEXT
			);

			expect(doc.getElementsByClassName(' \f\n\r\t')).toHaveLength(0);
		});
		test('should return only the case sensitive matching names', () => {
			const MIXED_CASES = ['AAA', 'AAa', 'AaA', 'aAA'];
			const doc = getTestParser().parser.parseFromString(INPUT(...MIXED_CASES), MIME_TYPE.XML_TEXT);

			MIXED_CASES.forEach((className) => {
				expect(doc.getElementsByClassName(className)).toHaveLength(1);
			});
		});
	});
	test('getElementById', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" id="root">' +
				'<child id="a1" title="1"><child id="a2"  title="2" empty-title=""/></child>' +
				'<child id="a1"   title="3"/></xml>',
			MIME_TYPE.XML_TEXT
		);
		expect(doc.getElementById('root')).not.toBeNull();
		expect(doc.getElementById('a1').getAttribute('title')).toBe('1');
		expect(doc.getElementById('a2').getAttribute('title')).toBe('2');
		expect(doc.getElementById('a2').getAttribute('empty-title')).toBe('');
		expect(doc.getElementById('a2').getAttribute('title2')).toBe(null);
	});
	describe('getElementsByTagName', () => {
		test('should return the correct number of elements in XML documents', () => {
			const doc = new DOMParser().parseFromString(
				`<xml id="0" lang="en">
						<head id="1"><title id="2">Title</title></head>
						<body id="3">
							<div id="4"><p id="5"></p></div>
							<html xmlns="${NAMESPACE.HTML}" id="6"><div id="7"></div></html>
						</body>
					</xml>`,
				MIME_TYPE.XML_TEXT
			);
			expect(doc.getElementsByTagName('*')).toHaveLength(8);
			expect(doc.documentElement.getElementsByTagName('*')).toHaveLength(7);
			expect(doc.getElementsByTagName('div')).toHaveLength(2);
			expect(doc.documentElement.getElementsByTagName('div')).toHaveLength(2);

			// in HTML documents inside the HTML namespace case doesn't have to match,
			// this is not an HTML document, so no div will be found,
			// not even the second one inside the HTML namespace
			expect(doc.getElementsByTagName('DIV')).toHaveLength(0);
			expect(doc.documentElement.getElementsByTagName('DIV')).toHaveLength(0);
		});

		test('should return the correct number of elements in HTML documents', () => {
			const doc = new DOMParser().parseFromString(
				`<html id="0" lang="en">
						<head id="1"><title id="2">Title</title></head>
						<body id="3">
							<div id="4"><p id="5"></p></div>
							<xml xmlns="${NAMESPACE.XML}" id="6"><div id="7"></div></xml>
						</body>
					</html>`,
				MIME_TYPE.HTML
			);
			expect(doc.getElementsByTagName('*')).toHaveLength(8);
			expect(doc.documentElement.getElementsByTagName('*')).toHaveLength(7);
			expect(doc.getElementsByTagName('div')).toHaveLength(2);
			expect(doc.documentElement.getElementsByTagName('div')).toHaveLength(2);

			// in HTML documents inside the HTML namespace case doesn't have to match,
			// but the second one is not in the HTML namespace
			const documentDIVs = doc.getElementsByTagName('DIV');
			expect(documentDIVs).toHaveLength(1);
			expect(documentDIVs.item(0).getAttribute('id')).toBe('4');
			const elementDIVs = doc.documentElement.getElementsByTagName('DIV');
			expect(elementDIVs).toHaveLength(1);
			expect(elementDIVs.item(0).getAttribute('id')).toBe('4');
		});

		test('should support API on element (this test needs to be split)', () => {
			const doc = new DOMParser().parseFromString(
				'<xml xmlns="http://test.com" xmlns:t="http://test.com" xmlns:t2="http://test2.com">' +
					'<t:test/><test/><t2:test/>' +
					'<child attr="1"><test><child attr="2"/></test></child>' +
					'<child attr="3"/></xml>',
				MIME_TYPE.XML_TEXT
			);

			const childs1 = doc.documentElement.getElementsByTagName('child');
			expect(childs1.item(0).getAttribute('attr')).toBe('1');
			expect(childs1.item(1).getAttribute('attr')).toBe('2');
			expect(childs1.item(2).getAttribute('attr')).toBe('3');
			expect(childs1).toHaveLength(3);

			const childs2 = doc.getElementsByTagName('child');
			expect(childs2.item(0).getAttribute('attr')).toBe('1');
			expect(childs2.item(1).getAttribute('attr')).toBe('2');
			expect(childs2.item(2).getAttribute('attr')).toBe('3');
			expect(childs2).toHaveLength(3);

			const childs3 = doc.documentElement.getElementsByTagName('*');
			for (let i = 0, buf = []; i < childs3.length; i++) {
				buf.push(childs3[i].tagName);
			}
			expect(childs3).toHaveLength(7);

			const feed = new DOMParser().parseFromString('<feed><entry>foo</entry></feed>', MIME_TYPE.XML_TEXT);
			const entries = feed.documentElement.getElementsByTagName('entry');
			expect(entries).toHaveLength(1);
			expect(entries[0].nodeName).toBe('entry');
			expect(feed.documentElement.childNodes.item(0).nodeName).toBe('entry');
		});
	});
	test('getElementsByTagNameNS', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" xmlns:t="http://test.com" xmlns:t2="http://test2.com">' +
				'<t:test/><test/><t2:test/>' +
				'<child attr="1"><test><child attr="2"/></test></child>' +
				'<child attr="3"/></xml>',
			MIME_TYPE.XML_TEXT
		);

		const childs1 = doc.documentElement.getElementsByTagNameNS('http://test.com', '*');
		expect(childs1).toHaveLength(6);

		const childs2 = doc.getElementsByTagNameNS('http://test.com', '*');
		expect(childs2).toHaveLength(7);

		const childs3 = doc.documentElement.getElementsByTagNameNS('http://test.com', 'test');
		expect(childs3).toHaveLength(3);

		const childs4 = doc.getElementsByTagNameNS('http://test.com', 'test');
		expect(childs4).toHaveLength(3);

		const childs5 = doc.getElementsByTagNameNS('*', 'test');
		expect(childs5).toHaveLength(4);

		const childs6 = doc.documentElement.getElementsByTagNameNS('*', 'test');
		expect(childs6).toHaveLength(4);
	});
	describe('createElement', () => {
		test('should create elements with exact cased name in an XML document', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument(null, 'xml');

			const element = doc.createElement('XmL');

			expect(element.nodeName).toBe('XmL');
			expect(element.localName).toBe(element.nodeName);
		});
		test('should create elements with exact cased name in an XHTML document', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument(NAMESPACE.HTML, '');

			const element = doc.createElement('XmL');

			expect(element.nodeName).toBe('XmL');
			expect(element.localName).toBe(element.nodeName);
		});
		test('should create elements with lower cased name in an HTML document', () => {
			// https://dom.spec.whatwg.org/#dom-document-createelement
			const impl = new DOMImplementation();
			const doc = impl.createHTMLDocument(false);

			const element = doc.createElement('XmL');

			expect(element.localName).toBe('xml');
			expect(element.nodeName).toBe('xml');
			expect(element.tagName).toBe(element.nodeName);
		});
		test('should create elements with no namespace in an XML document without default namespace', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument(null, 'xml');

			const element = doc.createElement('XmL');

			expect(element.namespaceURI).toBeNull();
		});
		test('should create elements with the HTML namespace in an XML document with HTML namespace', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument(NAMESPACE.HTML, 'xml');

			const element = doc.createElement('XmL');

			expect(element.namespaceURI).toBe(NAMESPACE.HTML);
		});
		test('should create elements with the HTML namespace in an HTML document', () => {
			const impl = new DOMImplementation();
			const doc = impl.createHTMLDocument();

			const element = doc.createElement('a');

			expect(element.namespaceURI).toBe(NAMESPACE.HTML);
		});
	});
	describe('createAttribute', () => {
		const NAME = 'NaMe';
		test('should create name as passed in XML documents', () => {
			const doc = new DOMImplementation().createDocument(null, '');

			const attr = doc.createAttribute(NAME);

			expect(attr.ownerDocument).toBe(doc);
			expect(attr.name).toBe(NAME);
			expect(attr.localName).toBe(NAME);
			expect(attr.nodeName).toBe(NAME);
		});
		test('should create name as passed in XHTML documents', () => {
			const doc = new DOMImplementation().createDocument(NAMESPACE.HTML, '');

			const attr = doc.createAttribute(NAME);

			expect(attr.ownerDocument).toBe(doc);
			expect(attr.name).toBe(NAME);
			expect(attr.localName).toBe(NAME);
			expect(attr.nodeName).toBe(NAME);
		});
		test('should create lower cased name when passed in HTML document', () => {
			const doc = new DOMImplementation().createHTMLDocument(false);

			const attr = doc.createAttribute(NAME);

			expect(attr.ownerDocument).toBe(doc);
			expect(attr.name).toBe('name');
			expect(attr.localName).toBe('name');
			expect(attr.nodeName).toBe('name');
		});
		test('should throw InvalidCharacter DOMException if name is not matching QName', () => {
			const doc = new DOMImplementation().createHTMLDocument(false);

			expectDOMException(() => doc.createAttribute('123'), DOMExceptionName.InvalidCharacterError, 'in name "123"');
		});
	});
	describe('createEntityReference', () => {
		const NAME = 'NaMe';
		test('should create EntityReference in XML documents', () => {
			const doc = new DOMImplementation().createDocument(null, '');

			const eref = doc.createEntityReference(NAME);

			expect(eref.ownerDocument).toBe(doc);
			expect(eref.nodeType).toBe(doc.ENTITY_REFERENCE_NODE);
			expect(eref.nodeName).toBe(NAME);
			expect(eref.childNodes).toHaveLength(0);
		});
		test('should throw NotSupportedError in HTML document', () => {
			const doc = new DOMImplementation().createHTMLDocument(false);

			expectDOMException(() => doc.createEntityReference('valid'), DOMExceptionName.NotSupportedError, 'html');
		});
		test('should throw InvalidCharacter DOMException if name is not matching Name', () => {
			const doc = new DOMImplementation().createHTMLDocument(false);

			expectDOMException(() => doc.createEntityReference('123'), DOMExceptionName.InvalidCharacterError, 'name "123"');
		});
	});
	describe('insertBefore', () => {
		test('should insert the first element and set `documentElement`', () => {
			const doc = new DOMImplementation().createDocument(null, '');
			expect(doc.childNodes).toHaveLength(0);
			expect(doc.documentElement).toBeNull();
			const root = doc.createElement('root');
			doc.insertBefore(root);
			expect(doc.documentElement).toBe(root);
			expect(doc.childNodes).toHaveLength(1);
			expect(doc.childNodes.item(0)).toBe(root);
		});
		test('should prevent inserting a second element', () => {
			const doc = new DOMImplementation().createDocument(null, '');
			const root = doc.createElement('root');
			const second = doc.createElement('second');
			doc.insertBefore(root);
			expectDOMException(() => doc.insertBefore(second), DOMExceptionName.HierarchyRequestError, 'Only one element');
			expect(doc.documentElement).toBe(root);
			expect(doc.childNodes).toHaveLength(1);
		});
		test('should prevent inserting an element before a doctype', () => {
			const impl = new DOMImplementation();
			const doctype = impl.createDocumentType('DT');
			const doc = impl.createDocument(null, '', doctype);
			expect(doc.childNodes).toHaveLength(1);
			const root = doc.createElement('root');
			expectDOMException(() => doc.insertBefore(root, doctype), DOMExceptionName.HierarchyRequestError, 'only after doctype');
			expect(doc.documentElement).toBeNull();
			expect(doc.childNodes).toHaveLength(1);
			expect(root.parentNode).toBeNull();
		});
		test('should prevent inserting a second doctype', () => {
			const impl = new DOMImplementation();
			const doctype = impl.createDocumentType('DT');
			const doctype2 = impl.createDocumentType('DT2');
			const doc = impl.createDocument(null, '', doctype);
			expect(doc.childNodes).toHaveLength(1);
			expectDOMException(() => doc.insertBefore(doctype2), DOMExceptionName.HierarchyRequestError, 'Only one doctype');
			expect(doc.childNodes).toHaveLength(1);
		});
		test('should prevent inserting a doctype before a comment after an element', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument(null, 'root');
			const comment = doc.createComment('comment');
			doc.appendChild(comment);
			const doctype = impl.createDocumentType('DT');
			expect(doc.childNodes).toHaveLength(2);

			expectDOMException(() => doc.insertBefore(doctype, comment), DOMExceptionName.HierarchyRequestError, 'before an element');

			expect(doc.childNodes).toHaveLength(2);
		});
		test('should prevent inserting a doctype after an element', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument(null, '');
			const root = doc.createElement('root');
			doc.insertBefore(root);
			const doctype = impl.createDocumentType('DT');
			expect(doc.childNodes).toHaveLength(1);

			expectDOMException(() => doc.insertBefore(doctype), DOMExceptionName.HierarchyRequestError, 'element is present');

			expect(doc.childNodes).toHaveLength(1);
		});
		test('should prevent inserting before an child which is not a child of parent', () => {
			const doc = new DOMImplementation().createDocument(null, '');
			const root = doc.createElement('root');
			const withoutParent = doc.createElement('second');

			expectDOMException(() => doc.insertBefore(root, withoutParent), DOMExceptionName.NotFoundError);

			expect(doc.documentElement).toBeNull();
			expect(doc.childNodes).toHaveLength(0);
			expect(root.parentNode).toBeNull();
		});
		test('should insert doctype between processing instruction and element', () => {
			const doc = new DOMImplementation().createDocument(null, '');
			expect(doc.childNodes).toHaveLength(0);
			expect(doc.documentElement).toBeNull();

			const instruction = doc.createProcessingInstruction('target', 'data');
			doc.appendChild(instruction);

			const root = doc.createElement('root');
			doc.appendChild(root);
			expect(doc.childNodes).toHaveLength(2);
			expect(doc.childNodes.item(0)).toBe(instruction);
			expect(doc.childNodes.item(1)).toBe(root);

			const doctype = doc.implementation.createDocumentType('qualifiedName', '', '');
			doc.insertBefore(doctype, root);
			expect(doc.childNodes).toHaveLength(3);
			expect(instruction.previousSibling).toBeNull();
			expect(doc.childNodes.item(0)).toBe(instruction);
			expect(instruction.nextSibling).toBe(doctype);
			expect(doctype.previousSibling).toBe(instruction);
			expect(doc.childNodes.item(1)).toBe(doctype);
			expect(doctype.nextSibling).toBe(root);
			expect(root.previousSibling).toBe(doctype);
			expect(doc.childNodes.item(2)).toBe(root);
			expect(root.nextSibling).toBeNull();
		});
	});
	describe('replaceChild', () => {
		test('should remove the only element and add the new one', () => {
			const doc = new DOMImplementation().createDocument('', 'xml');
			const initialFirstChild = doc.firstChild;
			const replacement = doc.createElement('replaced');

			doc.replaceChild(replacement, doc.firstChild);

			expect(doc.childNodes).toHaveLength(1);
			expect(initialFirstChild.parentNode).toBeNull();
			expect(doc.documentElement.name).toBe(replacement.name);
		});
		test('should throw HierarchyRequestError DOMException when trying to replace a comment before a doctype with an element', () => {
			const doc = new DOMImplementation().createDocument('', 'xml');
			const initialFirstChild = doc.firstChild;
			const comment = doc.createComment('comment');
			doc.insertBefore(comment, initialFirstChild);
			expectDOMException(
				() => doc.replaceChild(doc.createElement('inserted'), comment),
				DOMExceptionName.HierarchyRequestError,
				'only after doctype'
			);
		});
		test('should throw HierarchyRequestError DOMException when trying to replace a comment before a doctype with a doctype', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument('', 'xml', impl.createDocumentType('dt'));
			const initialFirstChild = doc.firstChild;
			const comment = doc.createComment('comment');
			doc.insertBefore(comment, initialFirstChild);
			expectDOMException(
				() => doc.replaceChild(impl.createDocumentType('inserted'), comment),
				DOMExceptionName.HierarchyRequestError,
				'Only one doctype'
			);
		});
		test('should throw HierarchyRequestError DOMException when trying to replace a comment after an element with a doctype', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument('', 'xml');
			const comment = doc.createComment('comment');
			doc.appendChild(comment);
			expectDOMException(
				() => doc.replaceChild(impl.createDocumentType('inserted'), comment),
				DOMExceptionName.HierarchyRequestError,
				'before an element'
			);
		});
	});
	describe('removeChild', () => {
		test('should remove all connections to node', () => {
			const doc = new DOMImplementation().createDocument('', 'xml');
			doc.insertBefore(doc.createComment('just a comment'), doc.firstChild);
			expect(doc.childNodes).toHaveLength(2);
			const initialElement = doc.firstChild;

			doc.removeChild(initialElement);

			// expect(doc.documentElement).toBeNull();
			expect(initialElement.parentNode).toBeNull();
			expect(initialElement.nextSibling).toBeNull();
			expect(initialElement.previousSibling).toBeNull();
			expect(doc.childNodes).toHaveLength(1);
		});

		test('Remove child from non-parent node throws', async () => {
			const ISSUE_CHECK = `<xml>
				<a><x/></a>
				<b><y/></b>
			</xml>`;
			const dom = new DOMParser().parseFromString(ISSUE_CHECK, MIME_TYPE.XML_TEXT);
			const ys = dom.getElementsByTagName('y');
			const as = dom.getElementsByTagName('a');

			expectDOMException(() => as[0].removeChild(ys[0]), DOMExceptionName.NotFoundError);
			expect(dom.toString()).toBe(ISSUE_CHECK);
		});
	});
});
