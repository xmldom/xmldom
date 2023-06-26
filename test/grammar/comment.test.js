'use strict';

const { describe, expect, test } = require('@jest/globals');
const { Comment } = require('../../lib/grammar');
const { range } = require('./utils');

describe('Comment', () => {
	[
		'<!-- -->',
		'<!---->',
		'<!--- -->',
		'<!-- - -->',
		'<!--\t-->',
		'<!--\n-->',
		'<!--\r-->',
		'<!-- -->',
		`<!--${range('\x7F', '\x84')}-->`, // restricted char
		'<!--\x85-->',
		`<!--${range('\x86', '\x9F')}-->`, // restricted char
		`<!--${range('\uE000', '\uFFFD')}-->`,
		`<!--${range('\u{10000}', '\u{1FFFF}')}-->`,
		`<!--${range('\u{20000}', '\u{2FFFF}')}-->`,
		`<!--${range('\u{30000}', '\u{3FFFF}')}-->`,
		`<!--${range('\u{40000}', '\u{4FFFF}')}-->`,
		`<!--${range('\u{50000}', '\u{5FFFF}')}-->`,
		`<!--${range('\u{60000}', '\u{6FFFF}')}-->`,
		`<!--${range('\u{70000}', '\u{7FFFF}')}-->`,
		`<!--${range('\u{80000}', '\u{8FFFF}')}-->`,
		`<!--${range('\u{90000}', '\u{9FFFF}')}-->`,
		`<!--${range('\u{100000}', '\u{10FFFF}')}-->`,
	].forEach((valid) =>
		test(`should match ${valid}`, () => {
			expect(Comment.exec(valid)[0]).toBe(valid);
		})
	);
	[
		'<!-- ->',
		'<!-- --->',
		'<!---- -->',
		'<!--\x01-->', // restricted char
		'<!--\x08-->', // restricted char
		'<!--\x0B-->', // restricted char
		'<!--\x0C-->', // restricted char
		'<!--\x0E-->', // restricted char
		'<!--\x1F-->', // restricted char
		'<!--\uD800-->',
		'<!--\uDFFF-->',
		'<!--\uFFFE-->',
		'<!--\uFFFF-->',
	].forEach((invalid) =>
		test(`should not match ${invalid}`, () => {
			expect(Comment.test(invalid)).toBe(false);
		})
	);
});
