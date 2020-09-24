'use strict'

const { getTestParser } = require('../get-test-parser')

describe('errorHandle', () => {
	it.each(['text/html', 'text/xml'])('unclosed document in %s', (mimeType) => {
		const { errors, parser } = getTestParser()

		const actual = parser.parseFromString('<img>', mimeType).toString()

		expect({ actual, ...errors }).toMatchSnapshot()
	})

	it.each([
		['<test><!--', '<test/>'],
		['<r', '<r/>'],
	])('invalid xml node "%s"', (input, expected) => {
		const { errors, parser } = getTestParser()

		const actual = parser
			.parseFromString(input, 'text/xml')
			.documentElement.toString()

		expect({ actual, ...errors }).toMatchSnapshot({ actual: expected })
	})

	it('html attribute (miss quote)', () => {
		const { errors, parser } = getTestParser()

		const actual = parser
			.parseFromString('<img attr=1/>', 'text/html')
			.toString()

		expect({ actual, ...errors }).toMatchSnapshot()
	})

	it('valid html attribute value (<>&)', () => {
		const { errors, parser } = getTestParser()

		const actual = parser
			.parseFromString('<img attr="<>&"/>', 'text/html')
			.toString()

		expect({ actual, ...errors }).toMatchSnapshot()
	})
})
