'use strict'

const { DOMParser } = require('../../lib/dom-parser')

const XML_ERROR = '<html><body title="1<2"><table&lt;;test</body></body></html>'
const XML_ERROR_AND_WARNING = '<html disabled><1 1="2"/></body></html>'

describe('errorHandler', () => {
	it('only single function with two args builds map', () => {
		const errors = {}
		const parser = new DOMParser({
			errorHandler: function (key, msg) {
				errors[key] = msg
			},
		})

		parser.parseFromString(XML_ERROR_AND_WARNING, 'text/xml')

		expect(errors).toMatchObject({
			warning: expect.stringMatching(/.*/),
			error: expect.stringMatching(/.*/),
		})
	})

	it('only one function with one argument builds list', () => {
		const errors = []
		const parser = new DOMParser({
			errorHandler: function (msg) {
				errors.push(msg)
			},
		})

		parser.parseFromString(XML_ERROR_AND_WARNING, 'text/xml')

		expect(errors).toMatchObject([/\[xmldom warning]/, /\[xmldom error]/])
	})

	it.each(['warning', 'error'])(
		'errorHandler for only one level: %s',
		(level) => {
			const errors = []
			const parser = new DOMParser({
				errorHandler: {
					[level]: function (msg) {
						errors.push(msg)
					},
				},
			})

			parser.parseFromString(XML_ERROR_AND_WARNING, 'text/xml')

			expect(errors).toHaveLength(1)
		}
	)
	it.todo(
		'errorHandler for only one level: fatalError'
		/*
		I was not able to create a test case for a fatalError.
		It might need to be removed from the API, since all but one cases are in comments
		and an error is thrown instead. The one case left I was not able to reproduce.
		*/
	)

	it('error function throwing is not caught', () => {
		const errors = []
		const ERROR_MSG = 'FROM TEST'

		const parser = new DOMParser({
			locator: {}, // removing the locator makes the test fail!
			errorHandler: {
				error: function (msg) {
					errors.push(msg)
					throw new Error(ERROR_MSG)
				},
			},
		})

		expect(() => {
			parser.parseFromString(XML_ERROR, 'text/html')
		}).toThrow(ERROR_MSG)
		expect(errors).toMatchObject([/\n@#\[line\:\d+,col\:\d+\]/])
	})
})
