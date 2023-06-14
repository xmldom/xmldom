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

	test('unclosed inner', () => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString('<r><Page><Label /></Page  <Page></Page></r>', MIME_TYPE.XML_TEXT).toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});

	test('unclosed root', () => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString('<Page><Label class="title"/></Page  1', MIME_TYPE.XML_TEXT).toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});

	test('unclosed root followed by another tag', () => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString('<Page></Page  <hello></hello>', MIME_TYPE.XML_TEXT).toString();

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

	test('line error', () => {
		const xmlLineError = [
			'<package xmlns="http://ns.saxonica.com/xslt/export"',
			'         xmlns:fn="http://www.w3.org/2005/xpath-functions"',
			'         xmlns:xs="http://www.w3.org/2001/XMLSchema"',
			'         xmlns:vv="http://saxon.sf.net/generated-variable"',
			'         version="20"',
			'         packageVersion="1">',
			'  <co id="0" binds="1">',
			'</package>',
		].join('\r\n');
		const { errors, parser } = getTestParser({ locator: {} });

		const dom = parser.parseFromString(xmlLineError, MIME_TYPE.XML_TEXT);

		expect({
			lineNumber: dom.documentElement.firstChild.nextSibling.lineNumber,
			...(errors.length ? { errors } : undefined),
		}).toMatchSnapshot();
	});

	test('wrong closing tag', () => {
		const { errors, parser } = getTestParser({ locator: {} });

		const actual = parser
			.parseFromString(
				// TODO: xml not well formed but no warning or error, extract into different test?
				'<html><body title="1<2"><table>&lt;;test</body></body></html>',
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
