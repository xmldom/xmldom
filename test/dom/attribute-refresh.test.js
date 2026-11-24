'use strict';

const { describe, expect, test } = require('@jest/globals');
const { DOMParser } = require('../../lib');
const { NAMESPACE } = require('../../lib/conventions');

describe.each(['setAttribute', 'setAttributeNS'])('%s updates existing attributes', (method) => {
	test('refreshes live class queries while retaining the attribute node', () => {
		const doc = new DOMParser().parseFromString('<root><child class="old"/></root>', 'text/xml');
		const child = doc.documentElement.firstChild;
		const attribute = child.getAttributeNode('class');
		const oldMatches = doc.getElementsByClassName('old');
		const newMatches = doc.getElementsByClassName('new');
		expect(oldMatches.length).toBe(1);
		expect(newMatches.length).toBe(0);
		const args = ['class', 'new'];
		if (method === 'setAttributeNS') args.unshift(null);
		child[method].apply(child, args);
		expect(oldMatches.length).toBe(0);
		expect(newMatches.item(0)).toBe(child);
		expect(child.getAttributeNode('class')).toBe(attribute);
		expect(attribute.value).toBe('new');
		expect(attribute.nodeValue).toBe('new');
	});

	test('refreshes an updated namespace declaration', () => {
		const doc = new DOMParser().parseFromString('<root xmlns:p="urn:old"><child/></root>', 'text/xml');
		const root = doc.documentElement;
		const args = ['xmlns:p', 'urn:new'];
		if (method === 'setAttributeNS') args.unshift(NAMESPACE.XMLNS);
		root[method].apply(root, args);
		expect(root.lookupNamespaceURI('p')).toBe('urn:new');
		expect(root.firstChild.lookupNamespaceURI('p')).toBe('urn:new');
	});
});
