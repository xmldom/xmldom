'use strict';

const { describe, expect, test } = require('@jest/globals');
const { CDSect } = require('../../lib/grammar');
const { unicode } = require('./utils');

describe('CDATA', () => {
	test(`should not be greedy`, () => {
		const match = CDSect.exec('<![CDATA[foo]]>]]>');
		expect(match[0]).toBe('<![CDATA[foo]]>');
	});
	['<![CDATA[]]>', '<![CDATA[\t\n\r\x7F\x84\x85\x86\x9F\uE000\uFFFD\u{10000}\u{10FFFF}]]>'].forEach((valid) =>
		test(`should match ${unicode(valid)}`, () => {
			expect(CDSect.test(valid)).toBe(true);
		})
	);
	[
		'',
		'<![CDATA[foo',
		'<![CDATA[\x01]]>', // restricted char
		'<![CDATA[\x08]]>', // restricted char
		'<![CDATA[\x0B]]>', // restricted char
		'<![CDATA[\x0C]]>', // restricted char
		'<![CDATA[\x0E]]>', // restricted char
		'<![CDATA[\x1F]]>', // restricted char
		'<![CDATA[\uD800]]>',
		'<![CDATA[\uDFFF]]>',
		'<![CDATA[\uFFFE]]>',
		'<![CDATA[\uFFFF]]>',
	].forEach((invalid) =>
		test(`should not match ${unicode(invalid)}`, () => {
			expect(CDSect.test(invalid)).toBe(false);
		})
	);
});
