'use strict';

const { describe, test } = require('@jest/globals');
const { Text, DOMImplementation } = require('../../lib/dom');
const { DOMExceptionName } = require('../../lib/errors');
const { expectDOMException } = require('../errors/expectDOMException');

describe('Text.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new Text()).toThrow(TypeError);
		});
	});
	describe.each(['createTextNode', 'createCDATASection'])('splitText on %s', (factory) => {
		test.each([6, -1])('rejects offset %s without changing text or inserting a sibling', (offset) => {
			const doc = new DOMImplementation().createDocument(null, 'root', null);
			const node = doc.documentElement.appendChild(doc[factory]('hello'));
			expectDOMException(() => node.splitText(offset), DOMExceptionName.IndexSizeError);
			expect(node.data).toBe('hello');
			expect(node.nodeValue).toBe('hello');
			expect(node.length).toBe(5);
			expect(node.nextSibling).toBeNull();
			expect(doc.documentElement.firstChild).toBe(node);
			expect(doc.documentElement.childNodes.length).toBe(1);
		});

		test.each([
			[0, '', 'hello'],
			[5, 'hello', ''],
			['2', 'he', 'llo'],
			[2.9, 'he', 'llo'],
			[0x100000002, 'he', 'llo'],
		])('splits at unsigned-long offset %s', (offset, left, right) => {
			const doc = new DOMImplementation().createDocument(null, 'root', null);
			const node = doc.documentElement.appendChild(doc[factory]('hello'));
			const sibling = node.splitText(offset);
			expect(node.data).toBe(left);
			expect(node.nodeValue).toBe(left);
			expect(node.length).toBe(left.length);
			expect(sibling.data).toBe(right);
			expect(sibling.nodeValue).toBe(right);
			expect(sibling.length).toBe(right.length);
			expect(sibling.nodeType).toBe(node.TEXT_NODE);
			expect(node.nextSibling).toBe(sibling);
			expect(doc.documentElement.childNodes.length).toBe(2);
		});
	});
});
