'use strict';

const { describe, test, expect } = require('@jest/globals');
const { DOMImplementation, Node } = require('../../lib/dom');
const { DOMParser } = require('../../lib/dom-parser');
const { DOMExceptionName } = require('../../lib/errors');
const { expectDOMException } = require('../errors/expectDOMException');
const { MIME_TYPE } = require('../../lib/conventions');
const { performance } = require('perf_hooks');

describe('Node.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new Node()).toThrow(TypeError);
		});
	});
	describe('appendChild', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, '');

		test('should throw HierarchyRequestError DOMException if parent is not a valid node', () => {
			const doctype = impl.createDocumentType('doctype');
			const text = doc.createTextNode('text');
			const attr = doc.createAttribute('attr');
			const pi = doc.createProcessingInstruction('target', 'data');
			[doctype, text, attr, pi].forEach((node) => {
				expectDOMException(
					() => node.appendChild(),
					DOMExceptionName.HierarchyRequestError,
					`Unexpected parent node type ${node.nodeType}`
				);
			});
		});
		const MANY = 10 * 1000;
		const huge = `<xml>${[...Array(MANY).keys()].map((i) => `<node index="${i}"/>`).join('\n\t')}</xml>`;
		test(`should be able to parse and append ${MANY / 1000}k nodes with a good performance`, () => {
			const start = performance.now();
			new DOMParser().parseFromString(huge, MIME_TYPE.XML_TEXT);
			const duration = performance.now() - start;
			// with the issue the test was introduced for,
			// it took minutes for such an amount of nodes to be appended
			// it usually takes < 1sec on my machine, but let's make sure the test is not flaky anywhere
			expect(duration).toBeLessThanOrEqual(1500);
		});
	});
	describe('isConnected', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, '');
		const el = doc.createElement('test');

		test('should return false if node is not inside of a document', () => {
			expect(el.isConnected).toBe(false);
		});
		test('should return true if node is inside of a document', () => {
			doc.appendChild(el);
			expect(el.isConnected).toBe(true);
		});
	});
	describe('parentElement', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, '');
		const el1 = doc.createElement('test1');
		const el2 = doc.createElement('test2');

		test('should return null if there is no parent node', () => {
			expect(el1.parentElement).toBe(null);
		});
		test('should return null if parentNode is the document node', () => {
			doc.appendChild(el1);
			expect(el1.parentElement).toBe(null);
		});
		test('should return parent element if parentNode is an element', () => {
			el1.appendChild(el2);
			expect(el2.parentElement).toBe(el1);
		});
	});
	describe('contains', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, '');
		const el1 = doc.createElement('test1');
		const el2 = doc.createElement('test2');
		const el3 = doc.createElement('test3');
		el1.appendChild(el2);
		el2.appendChild(el3);

		test('should return true if otherNode is a child of this node', () => {
			expect(el1.contains(el2)).toBe(true);
		});
		test('should return true if otherNode is a descendant of this node', () => {
			expect(el1.contains(el3)).toBe(true);
		});
		test('should return true if otherNode is this node', () => {
			expect(el1.contains(el1)).toBe(true);
		});
		test('should return false if otherNode is a parent of this node', () => {
			expect(el2.contains(el1)).toBe(false);
		});
		test('should return false if otherNode null or undefined', () => {
			expect(el2.contains(undefined)).toBe(false);
			expect(el2.contains(null)).toBe(false);
		});
	});
	describe('getRootNode', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, '');
		const el1 = doc.createElement('test1');
		const el2 = doc.createElement('test2');
		el1.appendChild(el2);

		test('should return the root node of a structure with no document node', () => {
			expect(el2.getRootNode()).toEqual(el1);
		});
		test('should return itself if this is already the root node', () => {
			expect(el1.getRootNode()).toEqual(el1);
		});
		test('should return the document node when it is the root node', () => {
			doc.appendChild(el1);
			expect(el2.getRootNode()).toEqual(doc);
		});
	});
	describe('isEqualNode', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, '');

		test('should return false when other node is null', () => {
			expect(doc.isEqualNode(null)).toBe(false);
		});

		test("should return false when node types don't match", () => {
			expect(doc.isEqualNode(doc.createAttribute('attr1'))).toBe(false);
		});

		describe('Element', () => {
			test('should return false when both elements have a different amount of child nodes', () => {
				const el1 = doc.createElement('p');
				el1.appendChild(doc.createElement('child1'));
				el1.appendChild(doc.createElement('child2'));

				const el2 = doc.createElement('p');
				el2.appendChild(doc.createElement('child1'));
				expect(el1.tagName).toBe(el2.tagName);
				expect(el1.firstChild.isEqualNode(el2.firstChild)).toBe(true);
				expect(el1.isEqualNode(el2)).toBe(false);
			});

			test('should return false for elements with different localName', () => {
				expect(doc.createElement('one').isEqualNode(doc.createElement('two'))).toBe(false);
			});

			test('should return false for elements with same namespace and localName but different prefix', () => {
				const oneLocal = doc.createElementNS('namespaceURI', 'one:local');
				const twoLocal = doc.createElementNS('namespaceURI', 'two:local');
				expect(oneLocal.isEqualNode(twoLocal)).toBe(false);
			});
			test('should return false for elements with different attributes', () => {
				const el3 = doc.createElement('test3');
				const el4 = doc.createElement('test3');

				el3.setAttribute('class', 'test-class');
				expect(el3.isEqualNode(el4)).toBe(false);
			});

			test('should return true for elements with identical attributes in a different order', () => {
				const el3 = doc.createElement('test3');
				el3.setAttribute('style', '');
				el3.setAttribute('class', 'test-class');
				const el4 = doc.createElement('test3');
				el4.setAttribute('class', 'test-class');
				el4.setAttribute('style', '');
				expect(el3.toString()).not.toEqual(el4.toString());
				expect(el3.isEqualNode(el4)).toBe(true);
			});

			test('should return true for identical elements with the same tag name and no children', () => {
				const el3 = doc.createElement('test3');
				const el4 = doc.createElement('test3');
				expect(el3.isEqualNode(el4)).toBe(true);
			});
		});
		describe('Attribute', () => {
			test('should return false if namespaceURI is different', () => {
				const attr1 = doc.createAttributeNS('namespace1', 'ns:a');
				const attr2 = doc.createAttributeNS('namespace2', 'ns:a');
				expect(attr1.isEqualNode(attr2)).toBe(false);
			});
			test('should return false if localName is different in namespaced attribute', () => {
				const attr1 = doc.createAttributeNS('namespace1', 'ns:a');
				const attr2 = doc.createAttributeNS('namespace1', 'ns:b');
				expect(attr1.isEqualNode(attr2)).toBe(false);
			});
			test('should return false if localName is different in attribute without namespace', () => {
				const attr1 = doc.createAttribute('a');
				const attr2 = doc.createAttribute('b');
				expect(attr1.isEqualNode(attr2)).toBe(false);
			});
			test('should return false if value is different', () => {
				const attr1 = doc.createAttribute('a');
				attr1.value = 'first';
				const attr2 = doc.createAttribute('a');
				attr2.value = 'second';
				expect(attr1.isEqualNode(attr2)).toBe(false);
			});
		});

		describe('Text', () => {
			test('should return true for text nodes with the same data', () => {
				expect(doc.createTextNode('some text').isEqualNode(doc.createTextNode('some text'))).toBe(true);
			});

			test('should return false for text nodes with different data', () => {
				expect(doc.createTextNode('some text').isEqualNode(doc.createTextNode('different text'))).toBe(false);
			});
		});
		describe('Comment', () => {
			test('should return true for comment nodes with the same data', () => {
				expect(doc.createComment('This is a comment').isEqualNode(doc.createComment('This is a comment'))).toBe(true);
			});

			test('should return false for comment nodes with different data', () => {
				expect(doc.createComment('This is a comment').isEqualNode(doc.createComment('This is a different comment'))).toBe(false);
			});
		});
		describe('DocumentType', () => {
			test('should return true for document type nodes with identical names and IDs', () => {
				expect(impl.createDocumentType('html').isEqualNode(impl.createDocumentType('html'))).toBe(true);
			});

			test('should return false for document type nodes with different names', () => {
				expect(impl.createDocumentType('html').isEqualNode(impl.createDocumentType('svg', '', ''))).toBe(false);
			});

			test('should return false for document type nodes with different publicId', () => {
				expect(impl.createDocumentType('xml', 'pubId').isEqualNode(impl.createDocumentType('xml', ''))).toBe(false);
			});

			test('should return false for document type nodes with different systemId', () => {
				expect(impl.createDocumentType('xml', 'pubId').isEqualNode(impl.createDocumentType('xml', 'pubId', 'sysId'))).toBe(false);
			});
		});

		test('should return false for elements with different namespaces', () => {
			const el5 = doc.createElementNS('http://www.example.com', 'test5');
			const el6 = doc.createElementNS('http://www.another-example.com', 'test5');
			expect(el5.isEqualNode(el6)).toBe(false);
		});

		test('should return true for elements with the same namespaces, prefix, and localName', () => {
			const el5 = doc.createElementNS('http://www.example.com', 'prefix:test5');
			const el6 = doc.createElementNS('http://www.example.com', 'prefix:test5');
			expect(el5.isEqualNode(el6)).toBe(true);
		});

		test('should return false when attributes are not equal even if the rest of the node is', () => {
			const el7 = doc.createElement('test7');
			const el8 = doc.createElement('test7');
			el7.setAttribute('attr', 'value1');
			el8.setAttribute('attr', 'value2');
			expect(el7.isEqualNode(el8)).toBe(false);
		});
		describe('ProcessingInstruction', () => {
			test('should return true for processing instruction nodes with the same target and data', () => {
				const pi1 = doc.createProcessingInstruction('xml-stylesheet', 'href="mystyle.css"');
				const pi2 = doc.createProcessingInstruction('xml-stylesheet', 'href="mystyle.css"');
				expect(pi1.isEqualNode(pi2)).toBe(true);
			});

			test('should return false for processing instruction nodes with different target or data', () => {
				const pi1 = doc.createProcessingInstruction('xml-stylesheet', 'href="mystyle.css"');
				const pi2 = doc.createProcessingInstruction('xml-stylesheet', 'href="yourstyle.css"');
				expect(pi1.isEqualNode(pi2)).toBe(false);
			});
		});

		describe('childNodes', () => {
			test('should return false for elements with different child nodes', () => {
				const el1 = doc.createElement('p');
				el1.appendChild(doc.createElement('child1'));
				el1.firstChild.textContent = 'New text';

				const el2 = doc.createElement('p');
				el2.appendChild(doc.createElement('child1'));

				expect(el1.isEqualNode(el2)).toBe(false);
			});

			test('should return true for nodes with equal child nodes', () => {
				const el9 = doc.createElement('parent');
				el9.appendChild(doc.createElement('child'));
				const el10 = doc.createElement('parent');
				el10.appendChild(doc.createElement('child'));
				expect(el9.isEqualNode(el10)).toBe(true);
			});
		});
	});
	describe('cloneNode', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, '');

		test('returns a new object, not the same reference', () => {
			const el = doc.createElement('el');
			expect(el.cloneNode(false)).not.toBe(el);
		});
		test('shallow clone (false) does not include children', () => {
			const el = doc.createElement('parent');
			el.appendChild(doc.createElement('child'));
			expect(el.cloneNode(false).firstChild).toBeNull();
		});
		test('deep clone (true) includes all descendants', () => {
			const el = doc.createElement('parent');
			const child = doc.createElement('child');
			child.appendChild(doc.createTextNode('text'));
			el.appendChild(child);
			const clone = el.cloneNode(true);
			expect(clone.firstChild.nodeName).toBe('child');
			expect(clone.firstChild.firstChild.nodeValue).toBe('text');
		});
		test('attributes are cloned for Element', () => {
			const el = doc.createElement('el');
			el.setAttribute('foo', 'bar');
			expect(el.cloneNode(false).getAttribute('foo')).toBe('bar');
		});
		test('modifying clone attributes does not affect original', () => {
			const el = doc.createElement('el');
			el.setAttribute('foo', 'original');
			el.cloneNode(false).setAttribute('foo', 'modified');
			expect(el.getAttribute('foo')).toBe('original');
		});
		test('modifying clone children does not affect original', () => {
			const el = doc.createElement('parent');
			el.appendChild(doc.createElement('child'));
			const clone = el.cloneNode(true);
			clone.removeChild(clone.firstChild);
			expect(el.firstChild).not.toBeNull();
		});
		test('ownerDocument is preserved', () => {
			const el = doc.createElement('el');
			expect(el.cloneNode(false).ownerDocument).toBe(doc);
		});
		test('Text node: clones nodeValue', () => {
			const node = doc.createTextNode('hello');
			const clone = node.cloneNode();
			expect(clone.nodeValue).toBe('hello');
			expect(clone).not.toBe(node);
		});
		test('CDATASection node: clones data', () => {
			const node = doc.createCDATASection('raw<data>');
			const clone = node.cloneNode();
			expect(clone.nodeValue).toBe('raw<data>');
			expect(clone.nodeType).toBe(node.nodeType);
		});
		test('Comment node: clones data', () => {
			const node = doc.createComment('a comment');
			const clone = node.cloneNode();
			expect(clone.nodeValue).toBe('a comment');
			expect(clone.nodeType).toBe(node.nodeType);
		});
		test('DocumentFragment: deep clone includes children', () => {
			const frag = doc.createDocumentFragment();
			frag.appendChild(doc.createTextNode('a'));
			frag.appendChild(doc.createElement('el'));
			const clone = frag.cloneNode(true);
			expect(clone.childNodes.length).toBe(2);
			expect(clone.firstChild.nodeValue).toBe('a');
		});
		test('cloneNode(true) on a 10,100-depth tree succeeds without throwing RangeError (GHSA-2v35-w6hq-6mfw)', () => {
			const root = doc.createElement('root');
			let current = root;
			for (let i = 0; i < 10100; i++) {
				const child = doc.createElement('n');
				current.appendChild(child);
				current = child;
			}
			expect(() => root.cloneNode(true)).not.toThrow();
		});
	});
	describe('isSameNode', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, '');
		const el1 = doc.createElement('test1');
		const el2 = doc.createElement('test2');

		test('should return true if both nodes are referencing the same object', () => {
			expect(el1.isSameNode(el1)).toBe(true);
		});
		test('should return false if one node is referencing a different object', () => {
			expect(el1.isSameNode(el2)).toBe(false);
		});
	});
	describe('textContent', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, '');

		describe('on Element', () => {
			test('returns empty string when element has no children', () => {
				const el = doc.createElement('root');
				expect(el.textContent).toBe('');
			});
			test('returns data of a Text child', () => {
				const el = doc.createElement('root');
				el.appendChild(doc.createTextNode('hello'));
				expect(el.textContent).toBe('hello');
			});
			test('returns data of a CDATASection child', () => {
				const el = doc.createElement('root');
				el.appendChild(doc.createCDATASection('raw<data>'));
				expect(el.textContent).toBe('raw<data>');
			});
			test('excludes Comment nodes', () => {
				const el = doc.createElement('root');
				el.appendChild(doc.createComment('ignored'));
				expect(el.textContent).toBe('');
			});
			test('excludes ProcessingInstruction nodes', () => {
				const el = doc.createElement('root');
				el.appendChild(doc.createProcessingInstruction('pi', 'ignored'));
				expect(el.textContent).toBe('');
			});
			test('concatenates text from nested elements in document order', () => {
				const el = doc.createElement('root');
				const child = doc.createElement('child');
				child.appendChild(doc.createTextNode('world'));
				el.appendChild(doc.createTextNode('hello '));
				el.appendChild(child);
				expect(el.textContent).toBe('hello world');
			});
			test('concatenates only text across mixed content (text + comment + text)', () => {
				const el = doc.createElement('root');
				el.appendChild(doc.createTextNode('a'));
				el.appendChild(doc.createComment('ignored'));
				el.appendChild(doc.createTextNode('b'));
				expect(el.textContent).toBe('ab');
			});
			test('concatenates only text across mixed content (text + PI + text)', () => {
				const el = doc.createElement('root');
				el.appendChild(doc.createTextNode('a'));
				el.appendChild(doc.createProcessingInstruction('pi', 'ignored'));
				el.appendChild(doc.createTextNode('b'));
				expect(el.textContent).toBe('ab');
			});
		});

		describe('on DocumentFragment', () => {
			test('returns empty string for an empty fragment', () => {
				const frag = doc.createDocumentFragment();
				expect(frag.textContent).toBe('');
			});
			test('concatenates text, excludes Comment and ProcessingInstruction descendants', () => {
				const frag = doc.createDocumentFragment();
				frag.appendChild(doc.createTextNode('a'));
				frag.appendChild(doc.createComment('ignored'));
				frag.appendChild(doc.createProcessingInstruction('pi', 'ignored'));
				frag.appendChild(doc.createTextNode('b'));
				expect(frag.textContent).toBe('ab');
			});
		});

		describe('on deep tree (stack overflow guard)', () => {
			test('textContent on a 10,100-depth element tree succeeds without throwing RangeError (GHSA-2v35-w6hq-6mfw)', () => {
				const impl2 = new DOMImplementation();
				const doc2 = impl2.createDocument(null, 'root');
				let current = doc2.documentElement;
				for (let i = 0; i < 10100; i++) {
					const child = doc2.createElement('n');
					current.appendChild(child);
					current = child;
				}
				expect(() => void doc2.documentElement.textContent).not.toThrow();
			});
		});
		describe('on other node types (returns nodeValue)', () => {
			test('Text node returns its data', () => {
				const node = doc.createTextNode('hello');
				expect(node.textContent).toBe('hello');
			});
			test('CDATASection node returns its data', () => {
				const node = doc.createCDATASection('raw<data>');
				expect(node.textContent).toBe('raw<data>');
			});
			test('Comment node returns its own data', () => {
				const node = doc.createComment('comment text');
				expect(node.textContent).toBe('comment text');
			});
			test('ProcessingInstruction node returns its data', () => {
				const node = doc.createProcessingInstruction('target', 'pi data');
				expect(node.textContent).toBe('pi data');
			});
			test('Attr node returns its value', () => {
				const el = doc.createElement('el');
				el.setAttribute('name', 'attr value');
				const node = el.getAttributeNode('name');
				expect(node.textContent).toBe('attr value');
			});
			test('Document node returns null', () => {
				const d = impl.createDocument(null, null);
				expect(d.textContent).toBeNull();
			});
			test('DocumentType node returns null', () => {
				const doctype = impl.createDocumentType('html', '', '');
				expect(doctype.textContent).toBeNull();
			});
		});
	});
	describe('importNode', () => {
		const impl2 = new DOMImplementation();
		const srcDoc = impl2.createDocument(null, '');
		const dstDoc = impl2.createDocument(null, '');

		test('shallow import does not copy children', () => {
			const el = srcDoc.createElement('root');
			el.appendChild(srcDoc.createElement('child'));
			const imported = dstDoc.importNode(el, false);
			expect(imported.childNodes.length).toBe(0);
		});
		test('deep import copies all descendants', () => {
			const el = srcDoc.createElement('root');
			el.appendChild(srcDoc.createElement('child'));
			const imported = dstDoc.importNode(el, true);
			expect(imported.childNodes.length).toBe(1);
			expect(imported.firstChild.nodeName).toBe('child');
		});
		test('ownerDocument of imported node is the target document', () => {
			const el = srcDoc.createElement('el');
			const imported = dstDoc.importNode(el, false);
			expect(imported.ownerDocument).toBe(dstDoc);
		});
		test('ownerDocument of imported descendants is the target document', () => {
			const el = srcDoc.createElement('root');
			el.appendChild(srcDoc.createElement('child'));
			const imported = dstDoc.importNode(el, true);
			expect(imported.firstChild.ownerDocument).toBe(dstDoc);
		});
		test('parentNode of imported node is null', () => {
			const el = srcDoc.createElement('el');
			const imported = dstDoc.importNode(el, false);
			expect(imported.parentNode).toBeNull();
		});
		test('imported node is a different object from the source', () => {
			const el = srcDoc.createElement('el');
			const imported = dstDoc.importNode(el, false);
			expect(imported).not.toBe(el);
		});
		test('source document is not modified after deep import', () => {
			const el = srcDoc.createElement('root');
			el.appendChild(srcDoc.createElement('child'));
			dstDoc.importNode(el, true);
			expect(el.ownerDocument).toBe(srcDoc);
			expect(el.childNodes.length).toBe(1);
		});
		test('imports a Text node', () => {
			const text = srcDoc.createTextNode('hello');
			const imported = dstDoc.importNode(text, false);
			expect(imported.nodeValue).toBe('hello');
			expect(imported.ownerDocument).toBe(dstDoc);
		});
		test('imports a CDATASection node', () => {
			const cdata = srcDoc.createCDATASection('<raw>');
			const imported = dstDoc.importNode(cdata, false);
			expect(imported.nodeValue).toBe('<raw>');
			expect(imported.ownerDocument).toBe(dstDoc);
		});
		test('imports a Comment node', () => {
			const comment = srcDoc.createComment('note');
			const imported = dstDoc.importNode(comment, false);
			expect(imported.nodeValue).toBe('note');
			expect(imported.ownerDocument).toBe(dstDoc);
		});
		test('imports a ProcessingInstruction node', () => {
			const pi = srcDoc.createProcessingInstruction('target', 'data');
			const imported = dstDoc.importNode(pi, false);
			expect(imported.target).toBe('target');
			expect(imported.data).toBe('data');
			expect(imported.ownerDocument).toBe(dstDoc);
		});
		test('imports a DocumentFragment with children (deep)', () => {
			const frag = srcDoc.createDocumentFragment();
			frag.appendChild(srcDoc.createTextNode('a'));
			frag.appendChild(srcDoc.createElement('el'));
			const imported = dstDoc.importNode(frag, true);
			expect(imported.childNodes.length).toBe(2);
			expect(imported.firstChild.nodeValue).toBe('a');
		});
		test('importing an Attribute forces deep and copies its child text node', () => {
			const attr = srcDoc.createAttribute('key');
			attr.value = 'val';
			const imported = dstDoc.importNode(attr, false);
			expect(imported.value).toBe('val');
			expect(imported.ownerDocument).toBe(dstDoc);
		});
		test('importNode(node, true) on a 10,100-depth tree succeeds without throwing RangeError (GHSA-2v35-w6hq-6mfw)', () => {
			const impl2 = new DOMImplementation();
			const doc2 = impl2.createDocument(null, 'root');
			let current = doc2.documentElement;
			for (let i = 0; i < 10100; i++) {
				const child = doc2.createElement('n');
				current.appendChild(child);
				current = child;
			}
			const destDoc = impl2.createDocument(null, 'dest');
			expect(() => destDoc.importNode(doc2.documentElement, true)).not.toThrow();
		});
	});
});
