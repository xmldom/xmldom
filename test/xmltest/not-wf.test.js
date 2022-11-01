'use strict';

const xmltest = require('xmltest');
const { ParseError } = require('../../lib/conventions');
const { getTestParser } = require('../get-test-parser');
const { generateSnapshot } = require('./generate-snapshot');

describe('xmltest/not-wellformed', () => {
	describe('standalone', () => {
		const entries = xmltest.getEntries(xmltest.FILTERS.NOT_WF.SA.files, xmltest.FILTERS.xml);

		Object.entries(entries).forEach(([pathInZip, filename]) => {
			test(`should match ${filename} with snapshot`, async () => {
				const input = (await xmltest.getContent(pathInZip))
					// TODO: The DOCTYPE totally confuses xmldom :sic:
					// for now we remove it and any newlines after it so we have reasonable tests
					.replace(/^<!DOCTYPE doc \[[^\]]+]>[\r\n]*/m, '');

				const { errors, parser } = getTestParser();

				try {
					const actual = parser.parseFromString(input, 'text/xml');
					expect(generateSnapshot(actual, errors)).toMatchSnapshot();
				} catch (e) {
					expect(e).toBeInstanceOf(ParseError);
				}
			});
		});
	});
});
