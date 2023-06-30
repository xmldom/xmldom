'use strict';

const { describe, expect, test } = require('@jest/globals');
const { Char } = require('../../lib/grammar');
const { unicode } = require('./utils');

describe('Char', () => {
	[' ', '\t', '\n', '\r', '\x7F', '\x84', '\x85', '\x86', '\x9F', '\uE000', '\uFFFD', '\u{10000}', '\u{10FFFF}'].forEach(
		(valid) =>
			test(`should match ${unicode(valid)}`, () => {
				expect(Char.exec(valid)[0]).toBe(valid);
			})
	);
	[
		'\x01', // restricted char
		'\x08', // restricted char
		'\x0B', // restricted char
		'\x0C', // restricted char
		'\x0E', // restricted char
		'\x1F', // restricted char
		'\uD800',
		'\uDFFF',
		'\uFFFE',
		'\uFFFF',
	].forEach((invalid) =>
		test(`should not match ${unicode(invalid)}`, () => {
			expect(Char.test(invalid)).toBe(false);
		})
	);
});
