'use strict';

const xmltest = require('xmltest');
const { MIME_TYPE, ParseError } = require('../../lib/conventions');
const { getTestParser } = require('../get-test-parser');
const { generateSnapshot } = require('./generate-snapshot');

describe('xmltest/not-wellformed', () => {
	describe('standalone', () => {
		const entries = xmltest.getEntries(xmltest.FILTERS.NOT_WF.SA.files, xmltest.FILTERS.xml);

		Object.entries(entries).forEach(([pathInZip, filename]) => {
			test(`should match ${filename} with snapshot`, async () => {
				const input = await xmltest.getContent(pathInZip);

				const { errors, parser } = getTestParser();
				let actual;

				try {
					actual = parser.parseFromString(input, MIME_TYPE.XML_TEXT);
				} catch (e) {
					expect(e).toBeInstanceOf(ParseError);
					expect(e.message).toMatchSnapshot('caught');
				}
				actual && expect(generateSnapshot(actual, errors)).toMatchSnapshot('reported');
			});
		});
	});
});
