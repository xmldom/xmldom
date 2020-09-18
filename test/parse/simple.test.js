'use strict'

const { getTestParser } = require('../get-test-parser')

describe('parse', () => {
	it('simple', () => {
		const { errors, parser } = getTestParser()
		const actual = parser
			.parseFromString('<html><body title="1<2"></body></html>', 'text/html')
			.toString()
		expect({ actual, ...errors }).toMatchSnapshot()
	})

	it('unclosed inner', () => {
		const { errors, parser } = getTestParser()
		const actual = parser
			.parseFromString(
				'<r><Page><Label /></Page  <Page></Page></r>',
				'text/xml'
			)
			.toString()
		expect({ actual, ...errors }).toMatchSnapshot()
	})

	it('unclosed root', () => {
		const { errors, parser } = getTestParser()
		const actual = parser
			.parseFromString('<Page><Label class="title"/></Page  1', 'text/xml')
			.toString()
		expect({ actual, ...errors }).toMatchSnapshot()
	})

	it('svg test', () => {
		const svgCase = [
			'<svg>',
			'  <metadata>...</metadata>',
			'  <defs id="defs14">',
			'  <path id="path4" d="M 68.589358,...-6.363961,-6.363964 z" />',
			'  <path id="path4" d="M 68.589358,...-6.363961,-6.363964 z" /></defs>',
			'</svg>',
		].join('\n')
		const { errors, parser } = getTestParser({ locator: {} })
		const actual = parser.parseFromString(svgCase, 'text/xml').toString()
		expect({ actual, ...errors }).toMatchSnapshot()
	})

	it('line error', () => {
		const xmlLineError = [
			'<package xmlns="http://ns.saxonica.com/xslt/export"',
			'         xmlns:fn="http://www.w3.org/2005/xpath-functions"',
			'         xmlns:xs="http://www.w3.org/2001/XMLSchema"',
			'         xmlns:vv="http://saxon.sf.net/generated-variable"',
			'         version="20"',
			'         packageVersion="1">',
			'  <co id="0" binds="1">',
			'</package>',
		].join('\r\n')

		const { errors, parser } = getTestParser({ locator: {} })
		const dom = parser.parseFromString(xmlLineError, 'text/xml')
		const node = dom.documentElement.firstChild.nextSibling
		expect({ lineNumber: node.lineNumber, ...errors }).toMatchSnapshot()
	})

	it('wrong closing tag', () => {
		const { errors, parser } = getTestParser({ locator: {} })
		const actual = parser.parseFromString(
			'<html><body title="1<2"><table>&lt;;test</body></body></html>',
			'text/html'
		).toString()
		expect({ actual, ...errors }).toMatchSnapshot()
	})

	describe('invalid input', () => {
		it.each([
			['falsy string', ''],
			['object', {}],
			['number', 12345],
			['null', null],
		])('%s', (msg, testValue) => {
			const { parser } = getTestParser(rethrowErrorHandler())
			expect(() => parser.parseFromString(testValue)).toThrow(
				/^\[xmldom error\][\s]*invalid doc source[\s\S]*$/
			)
		})
	})
})

function rethrowErrorHandler() {
	return {
		errorHandler: {
			error: function (errorMessage) {
				throw errorMessage
			},
		},
	}
}
