'use strict';

const { describe, expect, test } = require('@jest/globals');
const xmltest = require('xmltest');
const { MIME_TYPE } = require('../../lib/conventions');
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
				let actual;
				try {
					actual = parser.parseFromString(input, MIME_TYPE.XML_TEXT).toString();
				} catch (error) {
					expect({ error, expected }).toMatchSnapshot('caught');
				}
				actual && expect(generateSnapshot(actual, errors, expected)).toMatchSnapshot();
			}, 2000);
		});
	});
});
