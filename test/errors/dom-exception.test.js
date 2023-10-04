'use strict';
const { describe, expect, test } = require('@jest/globals');
const { DOMException, DOMExceptionName } = require('../../lib/errors');

describe('DOMException', () => {
	const CODES = [
		DOMException.INDEX_SIZE_ERR,
		DOMException.DOMSTRING_SIZE_ERR,
		DOMException.HIERARCHY_REQUEST_ERR,
		DOMException.WRONG_DOCUMENT_ERR,
		DOMException.INVALID_CHARACTER_ERR,
		DOMException.NO_DATA_ALLOWED_ERR,
		DOMException.NO_MODIFICATION_ALLOWED_ERR,
		DOMException.NOT_FOUND_ERR,
		DOMException.NOT_SUPPORTED_ERR,
		DOMException.INUSE_ATTRIBUTE_ERR,
		DOMException.INVALID_STATE_ERR,
		DOMException.SYNTAX_ERR,
		DOMException.INVALID_MODIFICATION_ERR,
		DOMException.NAMESPACE_ERR,
		DOMException.INVALID_ACCESS_ERR,
		DOMException.VALIDATION_ERR,
		DOMException.TYPE_MISMATCH_ERR,
		DOMException.SECURITY_ERR,
		DOMException.NETWORK_ERR,
		DOMException.ABORT_ERR,
		DOMException.URL_MISMATCH_ERR,
		DOMException.QUOTA_EXCEEDED_ERR,
		DOMException.TIMEOUT_ERR,
		DOMException.INVALID_NODE_TYPE_ERR,
		DOMException.DATA_CLONE_ERR,
	];

	test.each(CODES)('should have correct name from code %s', (code) => {
		const name = new DOMException(code).name;
		expect(name).not.toBeUndefined();
		expect(DOMExceptionName).toHaveProperty(name);
		expect(new DOMException('test', name).code).toBe(code);
		expect(name).toMatchSnapshot();
	});
	test.each([-1, 0, 26])('should use invalid code %s as message', (code) => {
		const err = new DOMException(code);
		expect(err.message).toBe(code);
		expect(err.name).toBe(DOMExceptionName.Error);
		expect(err.code).toBe(0);
	});
	test('should be an instance of Error', () => {
		expect(new DOMException('') instanceof Error).toBe(true);
	});

	test('should be an instance of DOMException', () => {
		expect(new DOMException('') instanceof DOMException).toBe(true);
	});

	test('should store first string argument as message', () => {
		const error = new DOMException('FROM TEST');
		expect(error.message).toBe('FROM TEST');
	});

	test('should have correct StackTrace', () => {
		const message = 'MESSAGE';
		const error = new DOMException(message, DOMExceptionName.SecurityError);
		const stack = error.stack && error.stack.split(/[\n\r]+/);
		expect(stack && stack.length).toBeGreaterThanOrEqual(2);
		expect(stack[0]).toBe(`${DOMExceptionName.SecurityError}: ${message}`);
		expect(stack[1]).toContain(__filename);
	});

	test('Error should not be instanceof DOMException', () => {
		expect(new Error() instanceof DOMException).toBe(false);
	});
});
