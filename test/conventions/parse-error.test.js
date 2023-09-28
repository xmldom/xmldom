'use strict';
const { ParseError } = require('../../lib/conventions');

describe('ParseError', () => {
	test('should have name ParseError', () => {
		expect(new ParseError('').name).toBe('ParseError');
	});
	test('should be an instance of Error', () => {
		expect(new ParseError('') instanceof Error).toBe(true);
	});

	test('should be an instance of ParseError', () => {
		expect(new ParseError('') instanceof ParseError).toBe(true);
	});

	test('should store first argument as message', () => {
		const error = new ParseError('FROM TEST');
		expect(error.message).toBe('FROM TEST');
	});

	test('should store second argument as locator', () => {
		const locator = {};
		const error = new ParseError('', locator);
		expect(error.locator).toBe(locator);
	});

	test('should have correct StackTrace', () => {
		const error = new ParseError('MESSAGE');
		const stack = error.stack && error.stack.split(/[\n\r]+/);
		expect(stack && stack.length).toBeGreaterThan(1);
		expect(stack[0]).toBe('ParseError: MESSAGE');
		expect(stack[1]).toContain(__filename);
	});

	test('Error should not be instanceof ParseError', () => {
		expect(new Error() instanceof ParseError).toBe(false);
	});
});
