'use strict';

const { DOMImplementation } = require('../../lib');

describe('Document.doctype after tree mutations', () => {
	test('tracks insertion and removal', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, 'root', null);
		const type = impl.createDocumentType('root');
		doc.insertBefore(type, doc.documentElement);
		expect(doc.doctype).toBe(type);
		doc.removeChild(type);
		expect(doc.doctype).toBeNull();
		expect(doc.documentElement.nodeName).toBe('root');
	});

	test('tracks replacement, including replacement by another node type', () => {
		const impl = new DOMImplementation();
		const oldType = impl.createDocumentType('old');
		const doc = impl.createDocument(null, 'root', oldType);
		const newType = impl.createDocumentType('new');
		doc.replaceChild(newType, oldType);
		expect(doc.doctype).toBe(newType);
		doc.replaceChild(doc.createComment('no doctype'), newType);
		expect(doc.doctype).toBeNull();
	});

	test('tracks the cloned doctype without retaining the original', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, 'root', impl.createDocumentType('root'));
		const clone = doc.cloneNode(true);
		expect(clone.doctype).toBe(clone.firstChild);
		expect(clone.doctype).not.toBe(doc.doctype);
		expect(doc.cloneNode(false).doctype).toBeNull();
	});
});
