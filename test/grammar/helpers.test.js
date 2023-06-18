'use strict';

const { describe, expect, test } = require('@jest/globals');
const { reg, chars, chars_without, regg } = require('../../lib/grammar');
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
		expect(actual).toEqual(/[a-z.-]/);
		expect(actual.chars).toBe('a-z.-');
	});
	test('should throw if second parameter is not part of source', () => {
		expect(() => chars_without(/[a-z.-\]]/, 'x')).toThrow(Error);
	});
	test('should throw if second parameter falsy', () => {
		expect(() => chars_without(/[undefined]/)).toThrow(Error);
	});
	test('should throw if source is not starting with [', () => {
		expect(() => chars_without(/abc/, '')).toThrow('/abc/');
	});
});

describe('regg', () => {
	test('should wrap all arguments between (?: and )', () => {
		expect(regg(/abc/, '|', 'def')).toEqual(/(?:abc|def)/m);
	});
	test('should throw no arguments are provided', () => {
		expect(() => regg()).toThrow(Error);
	});
});
