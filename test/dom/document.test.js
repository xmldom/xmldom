'use strict'

const { getTestParser } = require('../get-test-parser')

const INPUT = (first = '', second = '', third = '', fourth = '') => `
<html >
	<body id="body">
		<p id="p1" class=" quote first   odd ${first} ">Lorem ipsum</p>
		<p id="p2" class=" quote second  even ${second} ">Lorem ipsum</p>
		<p id="p3" class=" quote third   odd ${third} ">Lorem ipsum</p>
		<p id="p4" class=" quote fourth  even ${fourth} ">Lorem ipsum</p>
	</body>
</html>
`

const NON_HTML_WHITESPACE =
	'\v\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff'

describe('Document.prototype', () => {
	describe('getElementsByClassName', () => {
		it('should be able to resolve [] as a class name', () => {
			const doc = getTestParser().parser.parseFromString(INPUT('[]'))
			expect(doc.getElementsByClassName('[]')).toHaveLength(1)
		})
		it('should be able to resolve [ as a class name', () => {
			const doc = getTestParser().parser.parseFromString(INPUT('['))
			expect(doc.getElementsByClassName('[')).toHaveLength(1)
		})
		it('should be able to resolve multiple class names in a different order', () => {
			const doc = getTestParser().parser.parseFromString(INPUT())
			expect(doc.getElementsByClassName('odd quote')).toHaveLength(2)
		})
		it('should be able to resolve non html whitespace as classname', () => {
			const doc = getTestParser().parser.parseFromString(
				INPUT(NON_HTML_WHITESPACE)
			)

			expect(
				doc.getElementsByClassName(`quote ${NON_HTML_WHITESPACE}`)
			).toHaveLength(1)
		})
		it('should not allow regular expression in argument', () => {
			const search = '(((a||||)+)+)+'
			const matching = 'aaaaa'
			expect(new RegExp(search).test(matching)).toBe(true)

			const doc = getTestParser().parser.parseFromString(
				INPUT(search, matching, search)
			)

			expect(doc.getElementsByClassName(search)).toHaveLength(2)
		})
		it('should return an empty collection when no class names or are passed', () => {
			const doc = getTestParser().parser.parseFromString(INPUT())

			expect(doc.getElementsByClassName('')).toHaveLength(0)
		})
		it('should return an empty collection when only spaces are passed', () => {
			const doc = getTestParser().parser.parseFromString(
				INPUT(' \f\n\r\t', ' \f\n\r\t', ' \f\n\r\t', ' \f\n\r\t')
			)

			expect(doc.getElementsByClassName(' \f\n\r\t')).toHaveLength(0)
		})
		it('should return only the case insensitive matching names', () => {
			const MIXED_CASES = ['AAA', 'AAa', 'AaA', 'aAA']
			const doc = getTestParser().parser.parseFromString(INPUT(...MIXED_CASES))

			MIXED_CASES.forEach((className) => {
				expect(doc.getElementsByClassName(className)).toHaveLength(1)
			})
		})
	})
})
