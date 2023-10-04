'use strict';

const { describe, test } = require('@jest/globals');
const { DOMImplementation } = require('../../lib/dom');
const { DOMExceptionName } = require('../../lib/errors');
const { expectDOMException } = require('../errors/expectDOMException');

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
				expectDOMException(
					() => node.appendChild(),
					DOMExceptionName.HierarchyRequestError,
					`Unexpected parent node type ${node.nodeType}`
				);
			});
		});
	});
});
