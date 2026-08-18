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
		// The end-tag trailing-whitespace trim must produce identical results whether
		// the whitespace run is empty, short, long, or mixed — the anchored trim that
		// replaced the backtracking `/[ \t\n\r]+$/g` keeps this byte-identical
		// (GHSA-x4fp-j954-r2f4).
		it.each([
			'<xml></xml>',
			'<xml></xml >',
			'<xml></xml\t\r\n >',
			'<xml></xml' + ' '.repeat(500) + '>',
		])('trailing-whitespace end tag %#', (input) => {
			const actual = new DOMParser()
				.parseFromString(input, 'text/xml')
				.toString()
			expect(actual).toBe('<xml/>')
		})
	})
	describe('a `<` where a tag name is expected (GHSA-93r5-fhx6-vmg9)', () => {
		it('reports the distinct message with the raw candidate and recovers to the same DOM', () => {
			const { parser, errors } = getTestParser()
			const actual = parser
				.parseFromString('<r>a<b</r>', MIME_TYPE.XML_TEXT)
				.toString()

			// DOM output is byte-identical to today's recovery (only the error text changed)
			expect(actual).toBe('<r>a&lt;b</r>')
			const messages = errors.error || []
			expect(messages.some((m) => /unexpected < in tag name: b/.test(m))).toBe(
				true
			)
			expect(messages.some((m) => /invalid tagName/.test(m))).toBe(false)
		})
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
			.parseFromString(
				`<xml><book></book ><title>Harry Potter</title></xml>`,
				'text/xml'
			)
			.toString()
		expect(actual).toBe(`<xml><book/><title>Harry Potter</title></xml>`)
	})

	it('closing tag without attribute value', () => {
		const actual = new DOMParser()
			.parseFromString(
				`<template>
	<view>
		<image lazy />
		<image></image>
	</view>
</template>`,
				'text/xml'
			)
			.toString()
		expect(actual).toBe(
			`<template>
	<view>
		<image lazy="lazy"/>
		<image/>
	</view>
</template>`
		)
	})
	it('closing tag with unquoted value following /', () => {
		const actual = new DOMParser()
			.parseFromString(
				`<template>
	<view>
		<image lazy=lazy/>
		<image></image>
	</view>
</template>`,
				'text/xml'
			)
			.toString()
		expect(actual).toBe(
			`<template>
	<view>
		<image lazy="lazy"/>
		<image/>
	</view>
</template>`
		)
	})
	it('closing tag with unquoted value following space and /', () => {
		const actual = new DOMParser()
			.parseFromString(
				`<template>
	<view>
		<image lazy=lazy />
		<image></image>
	</view>
</template>`,
				'text/xml'
			)
			.toString()
		expect(actual).toBe(
			`<template>
	<view>
		<image lazy="lazy"/>
		<image/>
	</view>
</template>`
		)
	})
	it('closing tag with unquoted value including /  followed by space /', () => {
		const { errors, parser } = getTestParser()
		const actual = parser
			.parseFromString(
				`<template>
	<view>
		<image lazy=lazy/ />
		<image></image>
	</view>
</template>`,
				'text/xml'
			)
			.toString()
		expect(errors).toMatchSnapshot()
		expect(actual).toBe(
			`<template>
	<view>
		<image lazy="lazy/"/>
		<image/>
	</view>
</template>`
		)
	})
	it('closing tag with unquoted value ending with //', () => {
		const { errors, parser } = getTestParser()

		const actual = parser
			.parseFromString(
				`<template>
	<view>
		<image lazy=lazy//>
		<image></image>
	</view>
</template>`,
				'text/xml'
			)
			.toString()
		expect(errors).toMatchSnapshot()
		expect(actual).toBe(
			`<template>
	<view>
		<image lazy="lazy/"/>
		<image/>
	</view>
</template>`
		)
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

		// https://www.w3.org/TR/xml/#AVNormalize
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

		it('should be able to have `constructor` attribute', () => {
			const { errors, parser } = getTestParser()

			const actual = parser
				.parseFromString('<xml constructor=""/>', 'text/xml')
				.toString()

			expect({ actual, ...errors }).toMatchSnapshot()
		})

		it('should be able to have `__prototype__` attribute', () => {
			const { errors, parser } = getTestParser()

			const actual = parser
				.parseFromString('<xml __prototype__=""/>', 'text/xml')
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

/**
 * The XML `ETag` production is `'</' Name S? '>'`: only optional whitespace may follow the `Name`.
 * A valid `Name` followed by whitespace and non-whitespace residue (e.g. `</a\nbogus>` or
 * `</a bogus>`) is not well-formed, but historically it was silently accepted. It is now reported
 * as a recoverable `error` (in both XML and HTML) while parsing recovers to byte-identical DOM.
 */
describe('end tag with trailing residue after the name', () => {
	it.each([
		['a space', ' '],
		['a tab', '\t'],
		['a line feed', '\n'],
		['a carriage return', '\r'],
	])(
		'reports a recoverable error for %s residue and recovers to byte-identical DOM',
		(_label, ws) => {
			const source = '<a></a' + ws + 'junk>'

			const cleanXml = new DOMParser()
				.parseFromString('<a></a>', MIME_TYPE.XML_TEXT)
				.toString()
			const xml = getTestParser()
			expect(
				xml.parser.parseFromString(source, MIME_TYPE.XML_TEXT).toString()
			).toBe(cleanXml)
			expect(
				(xml.errors.error || []).some((msg) =>
					/followed by whitespace and trailing content/.test(msg)
				)
			).toBe(true)
			expect(xml.errors.fatalError).toBeUndefined()

			const cleanHtml = new DOMParser()
				.parseFromString('<a></a>', MIME_TYPE.HTML)
				.toString()
			const html = getTestParser()
			expect(
				html.parser.parseFromString(source, MIME_TYPE.HTML).toString()
			).toBe(cleanHtml)
			expect(
				(html.errors.error || []).some((msg) =>
					/followed by whitespace and trailing content/.test(msg)
				)
			).toBe(true)
		}
	)

	it('does not report a clean end tag with only trailing whitespace', () => {
		const { errors, parser } = getTestParser()
		expect(
			parser.parseFromString('<a></a\r\n>', MIME_TYPE.XML_TEXT).toString()
		).toBe('<a/>')
		expect(errors.error).toBeUndefined()
	})
})
