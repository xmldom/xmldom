'use strict';

const { describe, expect, test } = require('@jest/globals');
const { getTestParser } = require('../get-test-parser');
const { DOMParser } = require('../../lib');
const { MIME_TYPE } = require('../../lib/conventions');

describe('XML Node Parse', () => {
	describe('no attribute', () => {
		test.each(['<xml ></xml>', '<xml></xml>', '<xml></xml \r\n>', '<xml />'])('%s', (input) => {
			const actual = new DOMParser().parseFromString(input, MIME_TYPE.XML_TEXT).toString();
			expect(actual).toBe('<xml/>');
		});
	});
	test('nested closing tag with whitespace', () => {
		const actual = new DOMParser()
			.parseFromString(
				`<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <author>Giada De Laurentiis</author
    >
    <title lang="en">Everyday Italian</title>
  </book>
</bookstore>`,
				MIME_TYPE.XML_TEXT
			)
			.toString();
		expect(actual).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <author>Giada De Laurentiis</author>
    <title lang="en">Everyday Italian</title>
  </book>
</bookstore>`);
	});

	test('sibling closing tag with whitespace', () => {
		const actual = new DOMParser()
			.parseFromString(`<xml><book></book ><title>Harry Potter</title></xml>`, MIME_TYPE.XML_TEXT)
			.toString();
		expect(actual).toBe(`<xml><book/><title>Harry Potter</title></xml>`);
	});

	test('closing tag without attribute value', () => {
		const { errors, parser } = getTestParser();
		const actual = parser
			.parseFromString(
				`<template>
	<view>
		<image lazy />
		<image></image>
	</view>
</template>`,
				MIME_TYPE.XML_TEXT
			)
			.toString();
		expect(errors).toMatchSnapshot();
		expect(actual).toBe(
			`<template>
	<view>
		<image lazy="lazy"/>
		<image/>
	</view>
</template>`
		);
	});
	test('closing tag with unquoted value following /', () => {
		const { errors, parser } = getTestParser();
		const actual = parser
			.parseFromString(
				`<template>
	<view>
		<image lazy=lazy/>
		<image></image>
	</view>
</template>`,
				MIME_TYPE.XML_TEXT
			)
			.toString();
		expect(errors).toMatchSnapshot();
		expect(actual).toBe(
			`<template>
	<view>
		<image lazy="lazy"/>
		<image/>
	</view>
</template>`
		);
	});
	test('closing tag with unquoted value following space and /', () => {
		const { errors, parser } = getTestParser();
		const actual = parser
			.parseFromString(
				`<template>
	<view>
		<image lazy=lazy />
		<image></image>
	</view>
</template>`,
				MIME_TYPE.XML_TEXT
			)
			.toString();
		expect(errors).toMatchSnapshot();
		expect(actual).toBe(
			`<template>
	<view>
		<image lazy="lazy"/>
		<image/>
	</view>
</template>`
		);
	});
	test('closing tag with unquoted value including /  followed by space /', () => {
		const { errors, parser } = getTestParser();
		const actual = parser
			.parseFromString(
				`<template>
	<view>
		<image lazy=lazy/ />
		<image></image>
	</view>
</template>`,
				MIME_TYPE.XML_TEXT
			)
			.toString();
		expect(errors).toMatchSnapshot();
		expect(actual).toBe(
			`<template>
	<view>
		<image lazy="lazy/"/>
		<image/>
	</view>
</template>`
		);
	});
	test('closing tag with unquoted value ending with //', () => {
		const { errors, parser } = getTestParser();

		const actual = parser
			.parseFromString(
				`<template>
	<view>
		<image lazy=lazy//>
		<image></image>
	</view>
</template>`,
				MIME_TYPE.XML_TEXT
			)
			.toString();
		expect(errors).toMatchSnapshot();
		expect(actual).toBe(
			`<template>
	<view>
		<image lazy="lazy/"/>
		<image/>
	</view>
</template>`
		);
	});

	it('sibling closing tag with same name and whitespace', () => {
		const actual = new DOMParser().parseFromString(`<xml><span>1</span><span>2</span ></xml>`, 'text/xml').toString();
		expect(actual).toBe(`<xml><span>1</span><span>2</span></xml>`);
	});

	describe('simple attributes', () => {
		describe('nothing special', () => {
			test.each(['<xml a="1" b="2"></xml>', '<xml a="1" b="2" ></xml>', '<xml a="1" b="2" />'])('%s', (input) => {
				const actual = new DOMParser().parseFromString(input, MIME_TYPE.XML_TEXT).toString();

				expect(actual).toBe('<xml a="1" b="2"/>');
			});
		});
		describe('empty b', () => {
			test.each(['<xml a="1" b=\'\'></xml>', '<xml a="1" b=\'\' ></xml>', '<xml  a="1" b=\'\'/>', '<xml  a="1" b=\'\' />'])(
				'%s',
				(input) => {
					expect(new DOMParser().parseFromString(input, MIME_TYPE.XML_TEXT).toString()).toBe('<xml a="1" b=""/>');
				}
			);
		});

		// https://www.w3.org/TR/xml/#AVNormalize
		describe('containing whitespace', () => {
			test('should transform whitespace literals into spaces', () => {
				const { parser } = getTestParser();
				const dom = parser.parseFromString(
					// `\r\n` would be replaced by `\n` due to https://www.w3.org/TR/xml/#sec-line-ends
					'<xml attr=" \t\n\r"/>',
					MIME_TYPE.XML_TEXT
				);

				const attr = dom.documentElement.attributes.getNamedItem('attr');

				expect(attr.value).toBe('    ');
			});

			test.each([
				['&#x9;', '\t'],
				['&#9;', '\t'],
				['&#xA;', '\n'],
				['&#xa;', '\n'],
				['&#10;', '\n'],
				['&#xD;', '\r'],
				['&#xd;', '\r'],
				['&#13;', '\r'],
				['&#x20;', ' '],
				['&#32;', ' '],
			])('should transform whitespace character reference %s to literal', (reference, literal) => {
				const { parser } = getTestParser();
				const dom = parser.parseFromString(`<xml attr="${reference}"/>`, MIME_TYPE.XML_TEXT);

				const attr = dom.documentElement.attributes.getNamedItem('attr');
				expect(attr.value).toBe(literal);
			});
		});

		test('should be able to have `constructor` attribute', () => {
			const { errors, parser } = getTestParser();

			const actual = parser.parseFromString('<xml constructor=""/>', MIME_TYPE.XML_TEXT).toString();

			expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
		});

		test('should be able to have `__prototype__` attribute', () => {
			const { errors, parser } = getTestParser();

			const actual = parser.parseFromString('<xml __prototype__=""/>', MIME_TYPE.XML_TEXT).toString();

			expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
		});
	});

	describe('namespaced attributes', () => {
		test.each([
			'<xml xmlns="1" xmlns:a="2" a:test="3"></xml>',
			'<xml xmlns="1" xmlns:a="2" a:test="3" ></xml>',
			'<xml xmlns="1" xmlns:a="2" a:test="3" />',
		])('%s', (input) => {
			const actual = new DOMParser().parseFromString(input, MIME_TYPE.XML_TEXT).toString();

			expect(actual).toBe('<xml xmlns="1" xmlns:a="2" a:test="3"/>');
		});
	});
});

/**
 * A valid end-tag name followed by a line break and trailing content (`</a\njunk>`) used to be
 * accepted silently, because the shared regexp builder anchored the end-tag matcher with the `m`
 * flag and the trailing residue after the line break was ignored. It is now reported — a
 * recoverable `error` in XML, a `warning` in HTML — while parsing recovers to byte-identical DOM.
 */
describe('end tag with a line break and trailing content', () => {
	const LINE_TERMINATORS = [
		['LF', '\n'],
		['CR', '\r'],
		['LS', '\u2028'],
		['PS', '\u2029'],
	];

	describe.each(LINE_TERMINATORS)('with a %s line terminator', (_label, lt) => {
		test('XML reports a recoverable error and recovers to byte-identical DOM', () => {
			const { errors, parser } = getTestParser();
			const actual = parser.parseFromString('<a></a' + lt + 'junk>', MIME_TYPE.XML_TEXT).toString();
			expect(actual).toBe('<a/>');
			expect(errors.some(([level, msg]) => level === 'error' && /line break and trailing content/.test(msg))).toBe(true);
		});

		test('HTML reports a recoverable warning and recovers to byte-identical DOM', () => {
			const { errors, parser } = getTestParser();
			const clean = new DOMParser().parseFromString('<a></a>', MIME_TYPE.HTML).toString();
			const actual = parser.parseFromString('<a></a' + lt + 'junk>', MIME_TYPE.HTML).toString();
			expect(actual).toBe(clean);
			expect(errors.some(([level, msg]) => level === 'warning' && /invalid trailing characters/.test(msg))).toBe(true);
		});
	});

	test('a valid end tag with trailing whitespace is still accepted without any report', () => {
		const { errors, parser } = getTestParser();
		const actual = parser.parseFromString('<a></a\r\n>', MIME_TYPE.XML_TEXT).toString();
		expect(actual).toBe('<a/>');
		expect(errors).toHaveLength(0);
	});
});
