'use strict';

const { describe, expect, test } = require('@jest/globals');
const { MIME_TYPE, ParseError } = require('../../lib/conventions');
const { getTestParser } = require('../get-test-parser');

describe('parse', () => {
	test('simple', () => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString('<html><body title="1<2"></body></html>', 'text/html').toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});

	test('svg test', () => {
		const svgCase = [
			'<svg>',
			'  <metadata>...</metadata>',
			'  <defs id="defs14">',
			'  <path id="path4" d="M 68.589358,...-6.363961,-6.363964 z" />',
			'  <path id="path4" d="M 68.589358,...-6.363961,-6.363964 z" /></defs>',
			'</svg>',
		].join('\n');
		const { errors, parser } = getTestParser({ locator: {} });

		const actual = parser.parseFromString(svgCase, MIME_TYPE.XML_TEXT).toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});

	test('wrong closing tag', () => {
		const { errors, parser } = getTestParser({ locator: {} });

		const actual = parser
			.parseFromString(
				// TODO: xml not well formed but no warning or error, extract into different test?
				'<html><body title="1<2"><table>&lt;;test</table></body></html>',
				'text/html'
			)
			.toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});

	describe('invalid input', () => {
		test.each([
			['falsy string', ''],
			['object', {}],
			['number', 12345],
			['null', null],
		])('%s', (msg, testValue) => {
			const { parser } = getTestParser();

			expect(() => parser.parseFromString(testValue, MIME_TYPE.XML_TEXT)).toThrow(ParseError);
		});
	});
});
