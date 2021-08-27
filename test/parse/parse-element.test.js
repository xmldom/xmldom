'use strict'

const { getTestParser } = require('../get-test-parser')
const { DOMParser } = require('../../lib')
const { MIME_TYPE } = require('../../lib/conventions')

describe('XML Node Parse', () => {
	describe('no attribute', () => {
		it.each(['<xml ></xml>', '<xml></xml>', '<xml></xml \r\n>', '<xml />'])(
			'%s',
			(input) => {
				const actual = new DOMParser()
					.parseFromString(input, 'text/xml')
					.toString()
				expect(actual).toBe('<xml/>')
			}
		)
	})
	it('nested closing tag with whitespace', () => {
		const actual = new DOMParser()
			.parseFromString(
				`<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <author>Giada De Laurentiis</author
    >
    <title lang="en">Everyday Italian</title>
  </book>
</bookstore>`,
				'text/xml'
			)
			.toString()
		expect(actual).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <author>Giada De Laurentiis</author>
    <title lang="en">Everyday Italian</title>
  </book>
</bookstore>`)
	})

	it('sibling closing tag with whitespace', () => {
		const actual = new DOMParser()
			.parseFromString(`<book></book ><title>Harry Potter</title>`, 'text/xml')
			.toString()
		expect(actual).toBe(`<book/><title>Harry Potter</title>`)
	})

	describe('simple attributes', () => {
		describe('nothing special', () => {
			it.each([
				'<xml a="1" b="2"></xml>',
				'<xml a="1" b="2" ></xml>',
				'<xml a="1" b="2" />',
			])('%s', (input) => {
				const actual = new DOMParser()
					.parseFromString(input, 'text/xml')
					.toString()

				expect(actual).toBe('<xml a="1" b="2"/>')
			})
		})
		describe('empty b', () => {
			it.each([
				'<xml a="1" b=\'\'></xml>',
				'<xml a="1" b=\'\' ></xml>',
				'<xml  a="1" b=\'\'/>',
				'<xml  a="1" b=\'\' />',
			])('%s', (input) => {
				expect(
					new DOMParser().parseFromString(input, 'text/xml').toString()
				).toBe('<xml a="1" b=""/>')
			})
		})

		describe('containing whitespace', () => {
			it('should transform whitespace literals into spaces', () => {
				const { parser } = getTestParser()
				const dom = parser.parseFromString(
					// `\r\n` would be replaced by `\n` due to https://www.w3.org/TR/xml/#sec-line-ends
					'<xml attr=" \t\n\r"/>',
					MIME_TYPE.XML_TEXT
				)

				const attr = dom.documentElement.attributes.getNamedItem('attr')

				expect(attr.value).toBe('    ')
			})

			it.each([
				['&#x9;', '\t'],
				['&#9;', '\t'],
				['&#xA;', '\n'],
				['&#xa;', '\n'],
				['&#10;', '\n'],
				['&#xD;', '\r'],
				['&#xd;', '\r'],
				['&#13;', '\r'],
				['&#x20;', ' '],
				['&#32;', ' '],
			])(
				'should transform whitespace character reference %s to literal',
				(reference, literal) => {
					const { parser } = getTestParser()
					const dom = parser.parseFromString(
						`<xml attr="${reference}"/>`,
						MIME_TYPE.XML_TEXT
					)

					const attr = dom.documentElement.attributes.getNamedItem('attr')
					expect(attr.value).toBe(literal)
				}
			)
		})

		it('unclosed root tag will be closed', () => {
			const { errors, parser } = getTestParser()

			const actual = parser
				.parseFromString('<xml a="1" b="2/">', 'text/xml')
				.toString()

			expect({ actual, ...errors }).toMatchSnapshot()
		})
	})

	describe('namespaced attributes', () => {
		it.each([
			'<xml xmlns="1" xmlns:a="2" a:test="3"></xml>',
			'<xml xmlns="1" xmlns:a="2" a:test="3" ></xml>',
			'<xml xmlns="1" xmlns:a="2" a:test="3" />',
		])('%s', (input) => {
			const actual = new DOMParser()
				.parseFromString(input, 'text/xml')
				.toString()

			expect(actual).toBe('<xml xmlns="1" xmlns:a="2" a:test="3"/>')
		})

		it('unclosed root tag will be closed', () => {
			const { errors, parser } = getTestParser()

			const actual = parser
				.parseFromString('<xml xmlns="1" xmlns:a="2" a:test="3/">', 'text/xml')
				.toString()

			expect({ actual, ...errors }).toMatchSnapshot()
		})
	})
})
