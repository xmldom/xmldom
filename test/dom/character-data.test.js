'use strict';

const { describe, expect, test } = require('@jest/globals');
const { CharacterData, DOMImplementation } = require('../../lib/dom');
const { DOMParser, XMLSerializer } = require('../../lib');
const { MIME_TYPE } = require('../../lib/conventions');
const { DOMExceptionName } = require('../../lib/errors');
const { expectDOMException } = require('../errors/expectDOMException');

describe('CharacterData.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new CharacterData()).toThrow(TypeError);
		});
	});
});

describe.each([
	['Text', (doc) => doc.createTextNode('hello')],
	['Comment', (doc) => doc.createComment('hello')],
	['CDATASection', (doc) => doc.createCDATASection('hello')],
	['ProcessingInstruction', (doc) => doc.createProcessingInstruction('target', 'hello')],
])('%s CharacterData offsets', (_name, createNode) => {
	const operations = [
		['substringData', (node, offset) => node.substringData(offset, 1)],
		['insertData', (node, offset) => node.insertData(offset, 'X')],
		['deleteData', (node, offset) => node.deleteData(offset, 1)],
		['replaceData', (node, offset) => node.replaceData(offset, 1, 'X')],
	];

	describe.each(operations)('%s', (_method, operation) => {
		test.each([6, -1])('rejects offset %s without changing the node', (offset) => {
			const doc = new DOMImplementation().createDocument(null, 'root', null);
			const node = doc.documentElement.appendChild(createNode(doc));
			expectDOMException(() => operation(node, offset), DOMExceptionName.IndexSizeError);
			expect(node.data).toBe('hello');
			expect(node.nodeValue).toBe('hello');
			expect(node.length).toBe(5);
			expect(doc.documentElement.firstChild).toBe(node);
			expect(doc.documentElement.childNodes.length).toBe(1);
		});
	});

	test('allows an offset equal to the data length', () => {
		const node = createNode(new DOMImplementation().createDocument(null, '', null));
		expect(node.substringData(5, 100)).toBe('');
		node.insertData(5, 'X');
		expect(node.data).toBe('helloX');
		node.deleteData(6, 100);
		expect(node.data).toBe('helloX');
		node.replaceData(6, 100, 'Y');
		expect(node.data).toBe('helloXY');
	});

	test.each([
		['1', '2', 'el', 'hXlo'],
		[1.9, 2.9, 'el', 'hXlo'],
		[-0.5, 1, 'h', 'Xello'],
		[0x100000001, 0x100000002, 'el', 'hXlo'],
		[1, -1, 'ello', 'hX'],
		[1, Infinity, '', 'hXello'],
		[NaN, 1, 'h', 'Xello'],
	])('converts offset %s and count %s to unsigned longs before indexing', (offset, count, substring, replaced) => {
		const node = createNode(new DOMImplementation().createDocument(null, '', null));
		expect(node.substringData(offset, count)).toBe(substring);
		node.replaceData(offset, count, 'X');
		expect(node.data).toBe(replaced);
		expect(node.nodeValue).toBe(replaced);
		expect(node.length).toBe(replaced.length);
	});

	test('limits a count that extends beyond the remaining data', () => {
		const node = createNode(new DOMImplementation().createDocument(null, '', null));
		expect(node.substringData(1, 100)).toBe('ello');
		node.replaceData(1, 100, 'X');
		expect(node.data).toBe('hX');
	});
});

describe('CharacterData nodeValue/data sync', () => {
	describe.each([
		[
			'Text',
			() => {
				const doc = new DOMParser().parseFromString('<root>Hello</root>', MIME_TYPE.XML_TEXT);
				return doc.documentElement.firstChild;
			},
		],
		[
			'Comment',
			() => {
				const doc = new DOMParser().parseFromString('<root><!-- hello --></root>', MIME_TYPE.XML_TEXT);
				return doc.documentElement.firstChild;
			},
		],
		[
			'CDATASection',
			() => {
				const doc = new DOMParser().parseFromString('<root><![CDATA[hello]]></root>', MIME_TYPE.XML_TEXT);
				return doc.documentElement.firstChild;
			},
		],
	])('%s', (_name, createNode) => {
		test('direct nodeValue assignment updates data', () => {
			const node = createNode();
			node.nodeValue = 'Changed';
			expect(node.data).toBe('Changed');
		});

		test('direct nodeValue assignment updates length', () => {
			const node = createNode();
			node.nodeValue = 'Changed';
			expect(node.length).toBe(7);
		});

		test('direct data assignment updates nodeValue', () => {
			const node = createNode();
			node.data = 'Changed';
			expect(node.nodeValue).toBe('Changed');
		});

		test('direct data assignment updates length', () => {
			const node = createNode();
			node.data = 'Changed';
			expect(node.length).toBe(7);
		});

		test('XMLSerializer reflects nodeValue assignment', () => {
			const node = createNode();
			node.nodeValue = 'Serialized';
			expect(new XMLSerializer().serializeToString(node)).toContain('Serialized');
		});

		test('XMLSerializer reflects data assignment', () => {
			const node = createNode();
			node.data = 'Serialized';
			expect(new XMLSerializer().serializeToString(node)).toContain('Serialized');
		});

		test('nodeValue = null stays in sync', () => {
			const node = createNode();
			node.nodeValue = null;
			expect(node.data).toBe(node.nodeValue);
		});

		test('data = null stays in sync', () => {
			const node = createNode();
			node.data = null;
			expect(node.nodeValue).toBe(node.data);
		});

		test('replaceData still works correctly', () => {
			const node = createNode();
			node.replaceData(0, node.data.length, 'Replaced');
			expect(node.data).toBe('Replaced');
			expect(node.nodeValue).toBe('Replaced');
			expect(node.length).toBe(8);
		});

		test('appendData still works correctly', () => {
			const node = createNode();
			const original = node.data;
			node.appendData(' World');
			expect(node.data).toBe(original + ' World');
			expect(node.nodeValue).toBe(original + ' World');
		});
	});

	describe('ProcessingInstruction', () => {
		test('direct nodeValue assignment updates data', () => {
			const doc = new DOMParser().parseFromString('<?target initial?><root/>', MIME_TYPE.XML_TEXT);
			const pi = doc.firstChild;
			pi.nodeValue = 'Changed';
			expect(pi.data).toBe('Changed');
		});

		test('direct data assignment updates nodeValue', () => {
			const doc = new DOMParser().parseFromString('<?target initial?><root/>', MIME_TYPE.XML_TEXT);
			const pi = doc.firstChild;
			pi.data = 'Changed';
			expect(pi.nodeValue).toBe('Changed');
		});

		test('XMLSerializer reflects nodeValue assignment', () => {
			const doc = new DOMParser().parseFromString('<?target initial?><root/>', MIME_TYPE.XML_TEXT);
			const pi = doc.firstChild;
			pi.nodeValue = 'updated';
			expect(new XMLSerializer().serializeToString(pi)).toContain('updated');
		});
	});

	test('cloneNode preserves data/nodeValue/length', () => {
		const doc = new DOMParser().parseFromString('<root>Hello</root>', MIME_TYPE.XML_TEXT);
		const text = doc.documentElement.firstChild;
		text.nodeValue = 'CloneMe';
		const clone = text.cloneNode(false);
		expect(clone.data).toBe('CloneMe');
		expect(clone.nodeValue).toBe('CloneMe');
		expect(clone.length).toBe(7);
	});

	test('splitText preserves sync on both halves', () => {
		const doc = new DOMParser().parseFromString('<root>HelloWorld</root>', MIME_TYPE.XML_TEXT);
		const text = doc.documentElement.firstChild;
		const second = text.splitText(5);
		expect(text.data).toBe('Hello');
		expect(text.nodeValue).toBe('Hello');
		expect(text.length).toBe(5);
		expect(second.data).toBe('World');
		expect(second.nodeValue).toBe('World');
		expect(second.length).toBe(5);
	});
});

describe('CDATASection mutation vectors produce safe serializer output', () => {
	let doc;
	// Serializes, then re-parses, and returns true if an <injected> element appears in the tree.
	function isInjected(root) {
		const xml = new XMLSerializer().serializeToString(root);
		const reparsed = new DOMParser().parseFromString(xml, MIME_TYPE.XML_TEXT);
		return reparsed.getElementsByTagName('injected').length > 0;
	}

	beforeEach(() => {
		doc = new DOMImplementation().createDocument(null, 'root', null);
	});

	test('appendData introduces "]]>" safely', () => {
		const cdata = doc.createCDATASection('safe');
		doc.documentElement.appendChild(cdata);
		cdata.appendData(']]><injected/>');
		expect(isInjected(doc.documentElement)).toBe(false);
	});

	test('replaceData introduces "]]>" safely', () => {
		const cdata = doc.createCDATASection('safe data');
		doc.documentElement.appendChild(cdata);
		cdata.replaceData(4, 5, ']]><injected/>');
		expect(isInjected(doc.documentElement)).toBe(false);
	});

	test('.data assignment introduces "]]>" safely', () => {
		const cdata = doc.createCDATASection('safe');
		doc.documentElement.appendChild(cdata);
		cdata.data = 'evil]]><injected/>';
		expect(isInjected(doc.documentElement)).toBe(false);
	});

	test('.textContent assignment introduces "]]>" safely', () => {
		const cdata = doc.createCDATASection('safe');
		doc.documentElement.appendChild(cdata);
		cdata.textContent = 'evil]]><injected/>';
		expect(isInjected(doc.documentElement)).toBe(false);
	});
});
