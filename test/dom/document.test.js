'use strict';

const { getTestParser } = require('../get-test-parser');
const { DOMImplementation, DOMException } = require('../../lib/dom');

const INPUT = (first = '', second = '', third = '', fourth = '') => `
<html >
	<body id="body">
		<p id="p1" class=" quote first   odd ${first} ">Lorem ipsum</p>
		<p id="p2" class=" quote second  even ${second} ">Lorem ipsum</p>
		<p id="p3" class=" quote third   odd ${third} ">Lorem ipsum</p>
		<p id="p4" class=" quote fourth  even ${fourth} ">Lorem ipsum</p>
	</body>
</html>
`

const NON_HTML_WHITESPACE =
	'\v\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff'

describe('Document.prototype', () => {
	describe('getElementsByClassName', () => {
		it('should be able to resolve [] as a class name', () => {
			const doc = getTestParser().parser.parseFromString(INPUT('[]'))
			expect(doc.getElementsByClassName('[]')).toHaveLength(1)
		})
		it('should be able to resolve [ as a class name', () => {
			const doc = getTestParser().parser.parseFromString(INPUT('['))
			expect(doc.getElementsByClassName('[')).toHaveLength(1)
		})
		it('should be able to resolve multiple class names in a different order', () => {
			const doc = getTestParser().parser.parseFromString(INPUT())
			expect(doc.getElementsByClassName('odd quote')).toHaveLength(2)
		})
		it('should be able to resolve non html whitespace as classname', () => {
			const doc = getTestParser().parser.parseFromString(
				INPUT(NON_HTML_WHITESPACE)
			)

			expect(
				doc.getElementsByClassName(`quote ${NON_HTML_WHITESPACE}`)
			).toHaveLength(1)
		})
		it('should not allow regular expression in argument', () => {
			const search = '(((a||||)+)+)+'
			const matching = 'aaaaa'
			expect(new RegExp(search).test(matching)).toBe(true)

			const doc = getTestParser().parser.parseFromString(
				INPUT(search, matching, search)
			)

			expect(doc.getElementsByClassName(search)).toHaveLength(2)
		})
		it('should return an empty collection when no class names or are passed', () => {
			const doc = getTestParser().parser.parseFromString(INPUT())

			expect(doc.getElementsByClassName('')).toHaveLength(0)
		})
		it('should return an empty collection when only spaces are passed', () => {
			const doc = getTestParser().parser.parseFromString(
				INPUT(' \f\n\r\t', ' \f\n\r\t', ' \f\n\r\t', ' \f\n\r\t')
			)

			expect(doc.getElementsByClassName(' \f\n\r\t')).toHaveLength(0)
		})
		it('should return only the case insensitive matching names', () => {
			const MIXED_CASES = ['AAA', 'AAa', 'AaA', 'aAA']
			const doc = getTestParser().parser.parseFromString(INPUT(...MIXED_CASES))

			MIXED_CASES.forEach((className) => {
				expect(doc.getElementsByClassName(className)).toHaveLength(1)
			})
		})
	})
	describe('doctype', () => {
		it('should be added when passed to createDocument', () => {
			const impl = new DOMImplementation()
			const doctype = impl.createDocumentType('name')
			const doc = impl.createDocument(null, undefined, doctype)

			expect(doc.doctype === doctype).toBe(true)
			expect(doctype.ownerDocument === doc).toBe(true)
			expect(doc.firstChild === doctype).toBe(true)
		})
	})
	describe('insertBefore', () => {
		it('should insert the first element and set `documentElement`', () => {
			const doc = new DOMImplementation().createDocument(null, '');
			expect(doc.childNodes).toHaveLength(0);
			expect(doc.documentElement).toBeNull();
			const root = doc.createElement('root');
			doc.insertBefore(root);
			expect(doc.documentElement).toBe(root);
			expect(doc.childNodes).toHaveLength(1);
			expect(doc.childNodes.item(0)).toBe(root);
		});
		it('should prevent inserting a second element', () => {
			const doc = new DOMImplementation().createDocument(null, '');
			const root = doc.createElement('root');
			const second = doc.createElement('second');
			doc.insertBefore(root);
			expect(() => doc.insertBefore(second)).toThrow(DOMException);
			expect(doc.documentElement).toBe(root);
			expect(doc.childNodes).toHaveLength(1);
		});
		it('should prevent inserting an element before a doctype', () => {
			const impl = new DOMImplementation();
			const doctype = impl.createDocumentType('DT');
			const doc = impl.createDocument(null, '', doctype);
			expect(doc.childNodes).toHaveLength(1);
			const root = doc.createElement('root');
			expect(() => doc.insertBefore(root, doctype)).toThrow(DOMException);
			expect(doc.documentElement).toBeNull();
			expect(doc.childNodes).toHaveLength(1);
			expect(root.parentNode).toBeNull();
		});
		it('should prevent inserting a second doctype', () => {
			const impl = new DOMImplementation();
			const doctype = impl.createDocumentType('DT');
			const doctype2 = impl.createDocumentType('DT2');
			const doc = impl.createDocument(null, '', doctype);
			expect(doc.childNodes).toHaveLength(1);
			expect(() => doc.insertBefore(doctype2)).toThrow(DOMException);
			expect(doc.childNodes).toHaveLength(1);
		});
		it('should prevent inserting a doctype after an element', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument(null, '');
			const root = doc.createElement('root');
			doc.insertBefore(root);
			const doctype = impl.createDocumentType('DT');
			expect(doc.childNodes).toHaveLength(1);

			expect(() => doc.insertBefore(doctype)).toThrow(DOMException);

			expect(doc.childNodes).toHaveLength(1);
		});
		it('should prevent inserting before an child which is not a child of parent', () => {
			const doc = new DOMImplementation().createDocument(null, '');
			const root = doc.createElement('root');
			const withoutParent = doc.createElement('second');

			expect(() => doc.insertBefore(root, withoutParent)).toThrow(DOMException);

			expect(doc.documentElement).toBeNull()
			expect(doc.childNodes).toHaveLength(0)
			expect(root.parentNode).toBeNull()
		})
	})
	describe('replaceChild', () => {
		it('should remove the only element and add the new one', () => {
			const doc = new DOMImplementation().createDocument('', 'xml');
			const initialFirstChild = doc.firstChild;
			const replacement = doc.createElement('replaced');

			doc.replaceChild(replacement, doc.firstChild);

			expect(doc.childNodes).toHaveLength(1);
			expect(initialFirstChild.parentNode).toBeNull();
			expect(doc.documentElement.name).toBe(replacement.name);
		});
	});
	describe('removeChild', () => {
		it('should remove all connections to node', () => {
			const doc = new DOMImplementation().createDocument('', 'xml');
			doc.insertBefore(doc.createComment('just a comment'), doc.firstChild);
			expect(doc.childNodes).toHaveLength(2);
			const initialElement = doc.firstChild;

			doc.removeChild(initialElement);

			// expect(doc.documentElement).toBeNull();
			expect(initialElement.parentNode).toBeNull();
			expect(initialElement.nextSibling).toBeNull();
			// expect(initialElement.previousSibling).toBeNull();
			expect(doc.childNodes).toHaveLength(1);
		});
	});
})
