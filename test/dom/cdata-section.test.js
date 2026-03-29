'use strict'

const { DOMImplementation, DOMException } = require('../../lib/dom')
const { DOMParser } = require('../../lib')

describe('Document.prototype.createCDATASection', () => {
	let doc
	beforeEach(() => {
		doc = new DOMImplementation().createDocument(null, 'xml')
	})

	describe('throws InvalidCharacterError', () => {
		test('when data is exactly "]]>"', () => {
			expect(() => doc.createCDATASection(']]>')).toThrow(DOMException)
		})

		test('when data starts with safe content then contains "]]>"', () => {
			expect(() => doc.createCDATASection('safe]]>data')).toThrow(DOMException)
		})

		test('when data contains multiple "]]>" occurrences', () => {
			expect(() => doc.createCDATASection('before]]>after]]>after')).toThrow(
				DOMException
			)
		})
	})

	describe('does not throw', () => {
		test('when data is safe', () => {
			expect(() => doc.createCDATASection('safe')).not.toThrow()
		})

		test('when data is empty string', () => {
			expect(() => doc.createCDATASection('')).not.toThrow()
		})
	})

	describe('parse path', () => {
		test('parsing XML containing a CDATA section does not throw', () => {
			expect(() =>
				new DOMParser().parseFromString(
					'<root><![CDATA[some data]]></root>',
					'text/xml'
				)
			).not.toThrow()
		})
	})
})
