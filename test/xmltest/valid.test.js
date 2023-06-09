'use strict';

const xmltest = require('xmltest');
const { getTestParser } = require('../get-test-parser');
const { generateSnapshot } = require('./generate-snapshot');

describe('xmltest/valid', () => {
	describe('standalone', () => {
		const entries = xmltest.getEntries(xmltest.FILTERS.VALID.SA.files, xmltest.FILTERS.xml);

		Object.entries(entries).forEach(([pathInZip, filename]) => {
			test(`should match ${filename} with snapshot`, async () => {
				const input = await xmltest.getContent(pathInZip);

				const expected = await xmltest.getContent(xmltest.RELATED.out(pathInZip));

				const { errors, parser } = getTestParser();
				try {
					const actual = parser.parseFromString(input, 'text/xml').toString();

					expect(generateSnapshot(actual, errors, expected)).toMatchSnapshot();
				} catch (e) {
					expect([errors, e]).toMatchSnapshot();
				}
			});
		});
	});
});
