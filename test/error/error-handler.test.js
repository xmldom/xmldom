'use strict'

const { DOMParser } = require('../../lib')
const { REPORTED } = require('./reported')

describe('custom errorHandler', () => {
	it('function with two args receives key and message', () => {
		const errors = {}
		const parser = new DOMParser({
			// currently needs to be a `function` to make the test work,
			// `jest.fn()` or using `() => {}` doesn't work
			errorHandler: function (key, msg) {
				errors[key] = msg
			},
		})

		parser.parseFromString(REPORTED.WF_AttributeMissingQuote.source, 'text/xml')
		expect(errors).toHaveProperty('warning')
		parser.parseFromString(
			REPORTED.SYNTAX_AttributeEqualMissingValue.source,
			'text/xml'
		)
		expect(errors).toHaveProperty('error')
		parser.parseFromString(REPORTED.WF_DuplicateAttribute.source, 'text/xml')
		expect(errors).toHaveProperty('fatalError')
	})

	it('function with one argument builds list', () => {
		const errors = []
		const parser = new DOMParser({
			// currently needs to be a `function` to make the test work,
			// `jest.fn()` or using `() => {}` doesn't work
			errorHandler: function (msg) {
				errors.push(msg)
			},
		})

		parser.parseFromString(REPORTED.WF_AttributeMissingQuote.source, 'text/xml')
		parser.parseFromString(
			REPORTED.SYNTAX_AttributeEqualMissingValue.source,
			'text/xml'
		)
		parser.parseFromString(REPORTED.WF_DuplicateAttribute.source, 'text/xml')

		expect(errors).toMatchObject([
			/\[xmldom warning]/,
			/\[xmldom error]/,
			/\[xmldom fatalError]/,
		])
	})
})
