'use strict';

const { describe, expect, test } = require('@jest/globals');
const { Char, InvalidChar } = require('../../lib/grammar');
const { unicode } = require('./utils');

describe('Char and InvalidChar', () => {
	[' ', '\t', '\n', '\r', '\x7F', '\x84', '\x85', '\x86', '\x9F', '\uE000', '\uFFFD', '\u{10000}', '\u{10FFFF}'].forEach(
		(valid) => {
			test(`Char should match ${unicode(valid)}`, () => {
				expect(Char.exec(valid)[0]).toBe(valid);
			});
			test(`InvalidChar should not match ${unicode(valid)}`, () => {
				expect(InvalidChar.test(valid)).toBe(false);
			});
		}
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
	].forEach((invalid) => {
		test(`Char should not match ${unicode(invalid)}`, () => {
			expect(Char.test(invalid)).toBe(false);
		});
		test(`InvalidChar should match ${unicode(invalid)}`, () => {
			expect(InvalidChar.test(invalid)).toBe(true);
		});
	});
	test('InvalidChar should not match a string containing only valid chars', () => {
		expect(InvalidChar.test('hello world\t\n')).toBe(false);
	});
	test('InvalidChar should match a string containing an invalid char anywhere', () => {
		expect(InvalidChar.test('hello\x01world')).toBe(true);
	});
});
