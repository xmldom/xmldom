'use strict';

const { describe, expect, test } = require('@jest/globals');
const { MIME_TYPE } = require('../../lib/conventions');
const { DOMParser } = require('../../lib/dom-parser');

/**
 * Returns an array containing only one occurrence of every sting in `values`
 * (like in a Set).
 *
 * @param {string} values
 */
const uniqArray = (...values) => [...new Set(values)];

describe('XML Namespace Parse', () => {
	test('default namespace', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com"><child attr="1"/></xml>',
			MIME_TYPE.XML_TEXT
		);

		expect(
			uniqArray(
				documentElement.namespaceURI,
				documentElement.lookupNamespaceURI(''),
				documentElement.firstChild.namespaceURI,
				documentElement.firstChild.lookupNamespaceURI('')
			)
		).toMatchObject(['http://test.com']);
		expect(documentElement.firstChild.getAttributeNode('attr').namespaceURI).toBeNull();
	});

	test('prefix namespace', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml xmlns:p1="http://p1.com" xmlns:p2="http://p2.com"><p1:child a="1" p1:attr="1" b="2"/><p2:child/></xml>',
			MIME_TYPE.XML_TEXT
		);
		const firstChild = documentElement.firstChild;

		expect(
			uniqArray(
				documentElement.lookupNamespaceURI('p1'),
				firstChild.namespaceURI,
				firstChild.getAttributeNode('p1:attr').namespaceURI
			)
		).toMatchObject(['http://p1.com']);
		expect(uniqArray(firstChild.nextSibling.namespaceURI, firstChild.nextSibling.lookupNamespaceURI('p2'))).toMatchObject([
			'http://p2.com',
		]);
		expect(firstChild.getAttributeNode('attr')).toBeNull();
	});

	test('after prefix namespace', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml xmlns:p="http://test.com"><p:child xmlns:p="http://p.com"/><p:child/></xml>',
			MIME_TYPE.XML_TEXT
		);

		expect(documentElement.firstChild.namespaceURI).toStrictEqual('http://p.com');
		expect(documentElement.lastChild.namespaceURI).toStrictEqual('http://test.com');
		expect(documentElement.firstChild.nextSibling.lookupNamespaceURI('p')).toStrictEqual('http://test.com');
	});
});
