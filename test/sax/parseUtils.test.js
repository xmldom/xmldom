'use strict';

const { describe, expect, test } = require('@jest/globals');
const { parseUtils } = require('../../lib/sax');
describe('parseUtils', () => {
	test('should provide access to the values passed as arguments', () => {
		const start = 2;
		var source = 'source';
		const p = parseUtils(source, start);

		expect(p.getIndex()).toBe(start);
		expect(p.getSource()).toBe(source);
	});
	describe('char', () => {
		const start = 2;
		var source = 'source';
		const p = parseUtils(source, start);

		test('should return char at current position without any parameter', () => {
			expect(p.char()).toBe(source[start]);
		});
		test('should return char relative to current position with first parameter', () => {
			expect(p.char(-2)).toBe(source[start - 2]);
			expect(p.char(-1)).toBe(source[start - 1]);
			expect(p.char(0)).toBe(source[start]);
			expect(p.char(1)).toBe(source[start + 1]);
			expect(p.char(2)).toBe(source[start + 2]);
			expect(p.char(3)).toBe(source[start + 3]);
		});
		test('should return en empty string for relative indexes outside of source', () => {
			expect(p.char(-3)).toBe('');
			expect(p.char(4)).toBe('');
		});
	});
	describe('skip', () => {
		test('should move current index by one position without any parameter', () => {
			const start = 2;
			var source = 'source';
			const p = parseUtils(source, start);

			p.skip();

			expect(p.getIndex()).toBe(start + 1);
		});
		test('should skip relative to current position with first parameter', () => {
			const start = 2;
			var source = 'source';
			const p = parseUtils(source, start);

			p.skip(2);

			expect(p.getIndex()).toBe(start + 2);
		});
	});
	describe('skipBlanks', () => {
		test('should move current index nothing if no whitespace exists', () => {
			const start = 2;
			var source = 'source';
			const p = parseUtils(source, start);

			p.skipBlanks();

			expect(p.getIndex()).toBe(start);
		});
		test('should skip all kind of whitespace relative to current position', () => {
			const start = 2;
			const whitespace = ' \n\t\r ';
			var source = 'so' + whitespace + 'urce';
			const p = parseUtils(source, start);

			const positions = p.skipBlanks();

			expect(positions).toBe(whitespace.length);
			expect(p.char()).toBe('u');
		});
		test('should skip all kind of whitespace until end of source', () => {
			const start = 0;
			const whitespace = ' \n\t\r ';
			const p = parseUtils(whitespace, start);

			const positions = p.skipBlanks();

			expect(positions).toBe(-1);
			expect(p.getIndex()).toBe(whitespace.length);
		});
	});
	describe('substringStartsWith', () => {
		test('should return true if it matches', () => {
			const start = 2;
			var source = 'source';
			const p = parseUtils(source, start);

			const positions = p.skipBlanks();

			expect(p.substringStartsWith('urce')).toBe(true);
			expect(p.getIndex()).toBe(start);
		});
		test('should return false if it matches', () => {
			const start = 2;
			var source = 'source';
			const p = parseUtils(source, start);

			expect(p.substringStartsWith('no')).toBe(false);
			expect(p.getIndex()).toBe(start);
		});
	});
	describe('getMatch', () => {
		test('should return the match and move the current index', () => {
			const start = 2;
			var source = 'source';
			const p = parseUtils(source, start);

			const match = p.getMatch(/urc/);

			expect(match).toBe('urc');
			expect(p.getIndex()).toBe(start + match.length);
		});
		test('should not match things starting later and return null', () => {
			const start = 2;
			var source = 'source';
			const p = parseUtils(source, start);

			const match = p.getMatch(/rce/);

			expect(match).toBe(null);
			expect(p.getIndex()).toBe(start);
		});
	});
});
