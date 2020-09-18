'use strict'

const { getTestParser } = require('../get-test-parser')

describe('errorHandle', () => {
	it('unclosed tag', () => {
		const { errors, parser } = getTestParser()
		const actual = parser.parseFromString('<foo').toString()
		expect({ actual, ...errors }).toMatchSnapshot()
	})

	it('document source', () => {
		const testSource = '<?xml version="1.0"?>\n<!--test-->\n<xml/>'
		const { errors, parser } = getTestParser()
		const actual = parser.parseFromString(testSource, 'text/xml').toString()
		expect({ actual, ...errors }).toMatchSnapshot({
			actual: testSource,
		})
	})

	it('test', () => {
		const description = '<p>populaciji (< 0.1%), te se</p>'
		const { errors, parser } = getTestParser()
		const actual = parser.parseFromString(description, 'text/html').toString()
		expect({ actual, ...errors }).toMatchSnapshot({
			actual:
				'<p xmlns="http://www.w3.org/1999/xhtml">populaciji (&lt; 0.1%), te se</p>',
		})
	})
})
