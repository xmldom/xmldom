'use strict';
const { ParseError } = require('../../lib/sax');

describe('ParseError', () => {
	it('should have name ParseError', () => {
		expect(new ParseError('').name).toBe('ParseError');
	});
	it('should be an instance of Error', () => {
		expect(new ParseError('') instanceof Error).toBe(true);
	});

	it('should be an instance of ParseError', () => {
		expect(new ParseError('') instanceof ParseError).toBe(true);
	});

	it('should store first argument as message', () => {
		const error = new ParseError('FROM TEST');
		expect(error.message).toBe('FROM TEST');
	});

	it('should store second argument as locator', () => {
		const locator = {};
		const error = new ParseError('', locator);
		expect(error.locator).toBe(locator);
	});

	it('should have correct StackTrace', () => {
		const error = new ParseError('MESSAGE');
		const stack = error.stack && error.stack.split(/[\n\r]+/);
		expect(stack && stack.length).toBeGreaterThan(1);
		expect(stack[0]).toBe('ParseError: MESSAGE');
		expect(stack[1]).toContain(__filename);
	});

	it('Error should not be instanceof ParseError', () => {
		expect(new Error() instanceof ParseError).toBe(false);
	});
});
