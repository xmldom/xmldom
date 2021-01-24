'use strict'

const { getTestParser } = require('../get-test-parser')

describe('errorHandle', () => {
	it('unclosedcomment', () => {
		const { errors, parser } = getTestParser()

		const actual = parser.parseFromString('<!--', 'text/xml').toString()

		expect({ actual, ...errors }).toMatchSnapshot()
	})
})
