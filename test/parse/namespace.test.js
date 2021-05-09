'use strict'

const { DOMParser } = require('../../lib')

/**
 * Returns an array containing only one occurrence of every sting in `values` (like in a Set).
 *
 * @param values {string}
 */
const uniqArray = (...values) => [...new Set(values)]

describe('XML Namespace Parse', () => {
	it('default namespace', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com"><child attr="1"/></xml>',
			'text/xml'
		)

		expect(
			uniqArray(
				documentElement.namespaceURI,
				documentElement.lookupNamespaceURI(''),
				documentElement.firstChild.namespaceURI,
				documentElement.firstChild.lookupNamespaceURI('')
			)
		).toMatchObject(['http://test.com'])
		expect(
			documentElement.firstChild.getAttributeNode('attr').namespaceURI
		).toBeUndefined()
	})

	it('prefix namespace', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml xmlns:p1="http://p1.com" xmlns:p2="http://p2.com"><p1:child a="1" p1:attr="1" b="2"/><p2:child/></xml>',
			'text/xml'
		)
		const firstChild = documentElement.firstChild

		expect(
			uniqArray(
				documentElement.lookupNamespaceURI('p1'),
				firstChild.namespaceURI,
				firstChild.getAttributeNode('p1:attr').namespaceURI
			)
		).toMatchObject(['http://p1.com'])
		expect(
			uniqArray(
				firstChild.nextSibling.namespaceURI,
				firstChild.nextSibling.lookupNamespaceURI('p2')
			)
		).toMatchObject(['http://p2.com'])
		expect(firstChild.getAttributeNode('attr')).toBeUndefined()
	})

	it('after prefix namespace', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml xmlns:p="http://test.com"><p:child xmlns:p="http://p.com"/><p:child/></xml>',
			'text/xml'
		)

		expect(documentElement.firstChild.namespaceURI).toStrictEqual(
			'http://p.com'
		)
		expect(documentElement.lastChild.namespaceURI).toStrictEqual(
			'http://test.com'
		)
		expect(
			documentElement.firstChild.nextSibling.lookupNamespaceURI('p')
		).toStrictEqual('http://test.com')
	})
})
