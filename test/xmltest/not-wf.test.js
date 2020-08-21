const xmltest = require('xmltest')
const {getTestParser} = require('../get-test-parser')

describe('xmltest/not-wellformed', () => {
	describe('standalone', () => {
		const entries = xmltest.getEntries(
			xmltest.FILTERS.NOT_WF.SA.files,
			xmltest.FILTERS.xml
		)
		Object.entries(entries).forEach(([pathInZip, filename]) => {

			if (filename === '145.xml' || filename === '146.xml') {
				test.todo(`should match ${filename}, has strange chars that fail in snapshot`)
				return
			}

			test(`should match ${filename} with snapshot`, async () => {
				const input = (await xmltest.getContent(pathInZip))
					// TODO: The DOCTYPE totally confuses xmldom :sic:
					// for now we remove it and any newlines after it so we have reasonable tests
					.replace(/^<!DOCTYPE doc \[[^\]]+]>[\r\n]*/m, '')
				const {errors, parser} = getTestParser()

				// for 050.xml the result is undefined so `.toString()` needs to be careful
				const actual = parser.parseFromString(input)

				expect({actual: actual ? actual.toString() : actual, errors}).toMatchSnapshot()
			})
		})
	})
})
