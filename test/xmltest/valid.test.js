'use strict';

const xmltest = require('xmltest')
const { getTestParser } = require('../get-test-parser')
const { generateSnapshot } = require('./generate-snapshot')

describe('xmltest/valid', () => {
	describe('standalone', () => {
		const entries = xmltest.getEntries(
			xmltest.FILTERS.VALID.SA.files,
			xmltest.FILTERS.xml
		)

		Object.entries(entries).forEach(([pathInZip, filename]) => {
			test(`should match ${filename} with snapshot`, async () => {
				const input = (await xmltest.getContent(pathInZip))
					// TODO: The DOCTYPE totally confuses xmldom :sic:
					// for now we remove it and any newlines after it so we have reasonable tests
					.replace(/^<!DOCTYPE doc \[[^\]]+]>[\r\n]*/m, '')

				const expected = await xmltest.getContent(xmltest.RELATED.out(pathInZip))

				const { errors, parser } = getTestParser()

				const actual = parser.parseFromString(input).toString()

				expect(generateSnapshot(actual, errors, expected)).toMatchSnapshot()
			})
		})
	})
})
