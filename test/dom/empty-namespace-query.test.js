'use strict';

const { DOMImplementation } = require('../../lib');

describe('getElementsByTagNameNS with an empty namespace', () => {
	test('treats empty namespace as null and keeps the collection live', () => {
		const doc = new DOMImplementation().createDocument(null, 'root', null);
		const root = doc.documentElement;
		const plain = root.appendChild(doc.createElementNS(null, 'item'));
		const namespaced = root.appendChild(doc.createElementNS('urn:test', 'item'));
		const matches = root.getElementsByTagNameNS('', 'item');
		expect(Array.from(matches)).toEqual([plain]);
		expect(Array.from(doc.getElementsByTagNameNS('', '*'))).toEqual([root, plain]);
		expect(Array.from(root.getElementsByTagNameNS('*', 'item'))).toEqual([plain, namespaced]);
		const later = root.appendChild(doc.createElementNS('', 'item'));
		expect(Array.from(matches)).toEqual([plain, later]);
		root.removeChild(plain);
		expect(Array.from(matches)).toEqual([later]);
		expect(Array.from(root.getElementsByTagNameNS(null, 'item'))).toEqual([later]);
	});
});
