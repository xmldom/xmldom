'use strict'

const { getTestParser } = require('../get-test-parser')
const { DOMParser } = require('../../lib')

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
		const actual = new DOMParser().parseFromString(`<xml><book></book ><title>Harry Potter</title></xml>`, 'text/xml').toString();
		expect(actual).toBe(`<xml><book/><title>Harry Potter</title></xml>`);
	});

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
