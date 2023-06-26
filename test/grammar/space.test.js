'use strict';

const { describe, expect, test } = require('@jest/globals');
const { S, S_OPT } = require('../../lib/grammar');

describe('S', () => {
	['\x20\x09\x0D\x0A', ' \n\r\t', ' ', '\n', '\r', '\t'].forEach((valid) => {
		if (valid.length > 1) {
			test(`should match all ${valid.length} chars`, () => {
				expect(S.exec(valid)[0]).toBe(valid);
				expect(S.chars.length % valid.length).toBe(0);
			});
		} else {
			test(`should match \\x${valid.charCodeAt(0)}`, () => {
				expect(S.exec(valid)[0]).toBe(valid);
			});
		}
	});
	test('should not match the empty string', () => {
		expect(S.test('')).toBe(false);
	});
});
describe('S_OPT', () => {
	['\x20\x09\x0D\x0A', ' \n\r\t', ' ', '\n', '\r', '\t'].forEach((valid) => {
		if (valid.length > 1) {
			test(`should match all ${valid.length} chars`, () => {
				expect(S_OPT.exec(valid)[0]).toBe(valid);
				expect(S_OPT.chars.length % valid.length).toBe(0);
			});
		} else {
			test(`should match \\x${valid.charCodeAt(0)}`, () => {
				expect(S_OPT.exec(valid)[0]).toBe(valid);
			});
		}
	});
	test('should match the empty string', () => {
		expect(S_OPT.test('')).toBe(true);
	});
});
