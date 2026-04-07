'use strict';

const { describe, expect, test } = require('@jest/globals');
const { CharacterData, DOMImplementation } = require('../../lib/dom');
const { DOMParser, XMLSerializer } = require('../../lib');
const { MIME_TYPE } = require('../../lib/conventions');

describe('CharacterData.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new CharacterData()).toThrow(TypeError);
		});
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
