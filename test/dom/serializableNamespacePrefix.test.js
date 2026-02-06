'use strict';

const { describe, test, expect } = require('@jest/globals');
const { _serializableNamespacePrefix, DOMImplementation } = require('../../lib/dom');
const { NAMESPACE } = require('../../lib/conventions');

const xmlns = 'xmlns';
/**
 * @param {string | null} namespaceURI
 * @param {string} qualifiedName
 * @returns {Attr}
 */
const attr = (namespaceURI, qualifiedName) =>
	new DOMImplementation().createDocument(null, 'doc').createAttributeNS(namespaceURI, qualifiedName);

describe('serializableNamespacePrefix', () => {
	test('should return existing XMLNS prefix from node', () => {
		expect(_serializableNamespacePrefix(attr(NAMESPACE.XMLNS, `${xmlns}:a`), [])).toBe(xmlns);
	});
	test('should return existing prefix from node', () => {
		expect(_serializableNamespacePrefix(attr('url:x', `x:a`), [])).toBe('x');
	});
	test('should return null when URI is empty string', () => {
		expect(_serializableNamespacePrefix(attr('', `a`), [])).toBeNull();
	});
	test('should return null when URI is null', () => {
		expect(_serializableNamespacePrefix(attr(null, `a`), [])).toBeNull();
	});
});
