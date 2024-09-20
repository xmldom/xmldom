'use strict';

const { describe, test, expect } = require('@jest/globals');
const { DOMImplementation, Node } = require('../../lib/dom');
const { DOMExceptionName } = require('../../lib/errors');
const { expectDOMException } = require('../errors/expectDOMException');

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
		el1.appendChild(el2);

		test('should return true if otherNode is a child of this node', () => {
			expect(el1.contains(el2)).toBe(true);
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
});
