'use strict';

const { describe, expect, test, beforeEach } = require('@jest/globals');
const { spyOn } = require('jest-mock');
const { reg, chars, chars_without, regg, UNICODE_SUPPORT, detectUnicodeSupport } = require('../../lib/grammar');

test('should only be run with unicode support', () => {
	expect(UNICODE_SUPPORT).toBe(true);
});
describe('detectUnicodeSupport', () => {
	let execReturn;
	class MockRegExp {
		constructor() {}
		exec() {
			return execReturn;
		}
	}
	beforeEach(() => {
		execReturn = undefined;
	});
	test('should return false if regular expression throws', () => {
		const impl = () => {
			throw new Error('from test');
		};

		expect(detectUnicodeSupport(impl)).toBe(false);
	});
	test('should return false if regular expression does not match', () => {
		expect(detectUnicodeSupport(MockRegExp)).toBe(false);
	});
	test('should return false if regular expression matches string with length 1', () => {
		execReturn = ['1'];
		expect(detectUnicodeSupport(MockRegExp)).toBe(false);
	});
});

describe('reg', () => {
	test('should use RegExp.source', () => {
		expect(reg(/first/, 'second').source).toBe(/firstsecond/.source);
	});
	test('should throw when used with `|`', () => {
		expect(() => reg('|')).toThrow('regg');
	});
});

describe('chars', () => {
	test('should drop wrapping []', () => {
		expect(chars(/[a-z.-\]]/)).toBe('a-z.-\\]');
	});
	test('should drop wrapping []+', () => {
		expect(chars(/[a-z.-\]]+/)).toBe('a-z.-\\]');
	});
	test('should drop wrapping []{1,2}', () => {
		expect(chars(/[a-z.-\]]{1,2}}/)).toBe('a-z.-\\]');
	});
	test('should drop wrapping []{1,2}', () => {
		expect(chars(/[a-z.-\]]{1,2}}/)).toBe('a-z.-\\]');
	});
	test('should reject regexp not starting with [', () => {
		expect(() => chars(/abc/)).toThrow('/abc/');
	});
});
describe('chars_without', () => {
	test('should drop character ]', () => {
		var actual = chars_without(/[a-z.-\]]/, '\\]');
		expect(actual).toEqual(/[a-z.-]/u);
		expect(actual.chars).toBe('a-z.-');
	});
	test('should throw if second parameter is not part of source', () => {
		expect(() => chars_without(/[a-z.-\]]/, 'x')).toThrow(Error);
	});
	test('should throw if second parameter is not provided', () => {
		expect(() => chars_without(/[false]/)).toThrow(Error);
	});
	test('should throw if second parameter is not a string', () => {
		expect(() => chars_without(/[true]/, true)).toThrow(Error);
	});
	test('should throw if second parameter is empty string', () => {
		expect(() => chars_without(/[false]/, false)).toThrow(Error);
	});
	test('should throw if source is not starting with [', () => {
		expect(() => chars_without(/abc/, '')).toThrow('/abc/');
	});
});

describe('regg', () => {
	test('should wrap all arguments between (?: and )', () => {
		expect(regg(/abc/, '|', 'def')).toEqual(/(?:abc|def)/mu);
	});
	test('should throw no arguments are provided', () => {
		expect(() => regg()).toThrow(Error);
	});
});
