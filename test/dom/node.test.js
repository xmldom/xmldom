'use strict';

const { describe, expect, test } = require('@jest/globals');
const { DOMImplementation, Node } = require('../../lib/dom');
const { DOMException, DOMExceptionName } = require('../../lib/errors');

describe('Node.prototype', () => {
	describe('appendChild', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, '');

		test('should throw HierarchyRequestError DOMException if parent is not a valid node', () => {
		  const doctype = impl.createDocumentType('doctype');
			const text = doc.createTextNode('text');
			const attr = doc.createAttribute('attr');
			const pi = doc.createProcessingInstruction('target', 'data');
			[doctype, text, attr, pi].forEach((node) => {
				expect(() => node.appendChild()).toThrow(DOMException);
				expect(() => node.appendChild()).toThrow(expect.objectContaining({ name: DOMExceptionName.HierarchyRequestError }));
			});
		});
	});
});
