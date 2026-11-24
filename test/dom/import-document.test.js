'use strict';

const { DOMImplementation } = require('../../lib');

describe('importNode Document rejection', () => {
	test.each([false, true])('rejects documents without altering either tree (deep=%s)', (deep) => {
		const impl = new DOMImplementation();
		const source = impl.createDocument(null, 'source', null);
		const target = impl.createDocument(null, 'target', null);
		expect(() => target.importNode(source, deep)).toThrow(expect.objectContaining({ name: 'NotSupportedError' }));
		expect(source.toString()).toBe('<source/>');
		expect(target.toString()).toBe('<target/>');
		expect(source.ownerDocument).toBe(source);
	});

	test('continues to import a document element', () => {
		const impl = new DOMImplementation();
		const source = impl.createDocument(null, 'source', null);
		const target = impl.createDocument(null, 'target', null);
		const imported = target.importNode(source.documentElement, true);
		expect(imported.ownerDocument).toBe(target);
		expect(imported.parentNode).toBeNull();
		expect(imported.nodeName).toBe('source');
	});
});
