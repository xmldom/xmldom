'use strict';

const { DOMImplementation } = require('../../lib');

describe('doctype ordering without a document element', () => {
	test('allows inserting a doctype before an existing comment', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, null, null);
		const comment = doc.appendChild(doc.createComment('comment'));
		const type = impl.createDocumentType('root');
		expect(doc.insertBefore(type, comment)).toBe(type);
		expect(Array.from(doc.childNodes)).toEqual([type, comment]);
	});

	test('allows replacing a comment with a doctype before any root exists', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, null, null);
		const comment = doc.appendChild(doc.createComment('comment'));
		const type = impl.createDocumentType('root');
		doc.replaceChild(type, comment);
		expect(Array.from(doc.childNodes)).toEqual([type]);
	});

	test('still rejects inserting a doctype after the root element', () => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, 'root', null);
		const comment = doc.appendChild(doc.createComment('comment'));
		expect(() => doc.insertBefore(impl.createDocumentType('root'), comment)).toThrow(
			expect.objectContaining({ name: 'HierarchyRequestError' })
		);
		expect(() => doc.replaceChild(impl.createDocumentType('root'), comment)).toThrow(
			expect.objectContaining({ name: 'HierarchyRequestError' })
		);
	});
});
