'use strict'

const { getTestParser } = require('../get-test-parser')
const { DOMParser } = require('../../lib/dom-parser')

describe('XML Node Parse', () => {
	describe('no attribute', () => {
		it.each(['<xml ></xml>', '<xml></xml>', '<xml />'])('%s', (input) => {
			expect(
				new DOMParser().parseFromString(input, 'text/xml').toString()
			).toEqual('<xml/>')
		})
	})

	describe('simple attributes', () => {
		describe('nothing special', () => {
			it.each([
				'<xml a="1" b="2"></xml>',
				'<xml a="1" b="2" ></xml>',
				'<xml a="1" b="2" />',
			])('%s', (input) => {
				expect(
					new DOMParser().parseFromString(input, 'text/xml').toString()
				).toEqual('<xml a="1" b="2"/>')
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
				).toEqual('<xml a="1" b=""/>')
			})
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
			expect(
				new DOMParser().parseFromString(input, 'text/xml').toString()
			).toEqual('<xml xmlns="1" xmlns:a="2" a:test="3"/>')
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
