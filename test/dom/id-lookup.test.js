'use strict';

const { DOMImplementation } = require('../../lib');

describe('getElementById identifier matching', () => {
	const create = () => new DOMImplementation().createDocument(null, 'root', null);
	test('an empty ID never matches', () => {
		const doc = create();
		doc.documentElement.setAttribute('id', '');
		expect(doc.getElementById('')).toBeNull();
	});

	test('normalizes the query to a string once and matches it exactly', () => {
		const doc = create();
		const root = doc.documentElement;
		for (const id of ['01', '1', 'null', 'undefined']) {
			root.appendChild(doc.createElement('child')).setAttribute('id', id);
		}
		expect(doc.getElementById(1)).toBe(root.childNodes[1]);
		expect(doc.getElementById(null)).toBe(root.childNodes[2]);
		expect(doc.getElementById(undefined)).toBe(root.childNodes[3]);
		const toString = jest.fn(() => '1');
		expect(doc.getElementById({ toString })).toBe(root.childNodes[1]);
		expect(toString).toHaveBeenCalledTimes(1);
	});

	test('returns the first exact match and handles an empty document', () => {
		const doc = create();
		doc.documentElement.setAttribute('id', 'same');
		doc.documentElement.appendChild(doc.createElement('child')).setAttribute('id', 'same');
		expect(doc.getElementById('same')).toBe(doc.documentElement);
		expect(doc.getElementById('missing')).toBeNull();
		doc.removeChild(doc.documentElement);
		expect(doc.getElementById('same')).toBeNull();
	});
});
