'use strict';

const { DOMImplementation } = require('../../lib');

describe('ancestor insertion validity', () => {
	test.each(['appendChild', 'insertBefore', 'replaceChild'])('%s rejects an ancestor without modifying the tree', (method) => {
		const doc = new DOMImplementation().createDocument(null, 'root', null);
		const root = doc.documentElement;
		const parent = root.appendChild(doc.createElement('parent'));
		const child = parent.appendChild(doc.createElement('child'));
		expect(() => parent[method](root, child)).toThrow(expect.objectContaining({ name: 'HierarchyRequestError' }));
		expect(doc.toString()).toBe('<root><parent><child/></parent></root>');
		expect(root.parentNode).toBe(doc);
		expect(child.parentNode).toBe(parent);
	});

	test('rejects appending an element to itself', () => {
		const doc = new DOMImplementation().createDocument(null, 'root', null);
		const root = doc.documentElement;
		expect(() => root.appendChild(root)).toThrow(expect.objectContaining({ name: 'HierarchyRequestError' }));
		expect(root.parentNode).toBe(doc);
	});

	test('allows moving a descendant upward', () => {
		const doc = new DOMImplementation().createDocument(null, 'root', null);
		const root = doc.documentElement;
		const parent = root.appendChild(doc.createElement('parent'));
		const child = parent.appendChild(doc.createElement('child'));
		expect(root.appendChild(child)).toBe(child);
		expect(doc.toString()).toBe('<root><parent/><child/></root>');
	});
});
