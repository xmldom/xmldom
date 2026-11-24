'use strict';

const { DOMImplementation } = require('../../lib');

describe('cloning a Document', () => {
	test.each([false, true])('keeps document identity and implementation (deep=%s)', (deep) => {
		const impl = new DOMImplementation();
		const original = impl.createDocument(null, 'root', null);
		original.documentElement.setAttribute('id', 'root-id');
		original.documentElement.appendChild(original.createElement('child')).appendChild(original.createTextNode('text'));
		const clone = original.cloneNode(deep);
		expect(clone.ownerDocument).toBe(clone);
		expect(clone.implementation).toBe(impl);
		expect(clone.contentType).toBe(original.contentType);
		expect(clone.childNodes.length).toBe(deep ? 1 : 0);
		if (deep) {
			const root = clone.documentElement;
			expect(root.ownerDocument).toBe(clone);
			expect(root.getAttributeNode('id').ownerDocument).toBe(clone);
			expect(root.firstChild.ownerDocument).toBe(clone);
			expect(root.firstChild.firstChild.ownerDocument).toBe(clone);
			expect(root).not.toBe(original.documentElement);
			expect(original.documentElement.ownerDocument).toBe(original);
		}
	});
});
