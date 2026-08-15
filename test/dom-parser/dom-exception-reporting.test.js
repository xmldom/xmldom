'use strict';

const { describe, expect, test } = require('@jest/globals');
const { MIME_TYPE } = require('../../lib/conventions');
const { DOMParser, onErrorStopParsing } = require('../../lib/dom-parser');
const { ParseError, DOMException } = require('../../lib/errors');

/**
 * A `DOMException` raised while building the DOM during parsing (unbound namespace prefix,
 * hierarchy violation, ...) is reported to `onError` as a `fatalError` and rethrown as a
 * `ParseError`, with the `DOMException` preserved as its `cause` and a common
 * `Error constructing the DOM:` message prefix identifying the whole class.
 */
describe('DOMException reported during parsing', () => {
	const UNBOUND_PREFIX = '<a:b>';
	const NAMESPACE_MESSAGE = 'Error constructing the DOM: NamespaceError: prefix is non-null and namespace is null';

	/** Parse and return the thrown error, failing the test if nothing was thrown. */
	function parseAndCatch(source, mimeType, options) {
		try {
			new DOMParser(options).parseFromString(source, mimeType);
		} catch (error) {
			return error;
		}
		throw new Error('expected parseFromString to throw a ParseError');
	}

	describe.each([MIME_TYPE.XML_TEXT, MIME_TYPE.HTML])('with mimeType %s', (mimeType) => {
		test('throws a ParseError with the prefixed message', () => {
			const error = parseAndCatch(UNBOUND_PREFIX, mimeType);
			expect(error).toBeInstanceOf(ParseError);
			expect(error.message).toBe(NAMESPACE_MESSAGE);
		});

		test('reports it to onError once as a fatalError', () => {
			const errors = [];
			const parser = new DOMParser({ onError: (level, message) => errors.push([level, message]) });
			expect(() => parser.parseFromString(UNBOUND_PREFIX, mimeType)).toThrow(ParseError);
			expect(errors).toEqual([['fatalError', NAMESPACE_MESSAGE]]);
		});

		test('preserves the DOMException as the ParseError cause', () => {
			const error = parseAndCatch(UNBOUND_PREFIX, mimeType);
			expect(error.cause).toBeInstanceOf(DOMException);
			expect(error.cause.name).toBe('NamespaceError');
		});

		test('the thrown ParseError has a locator', () => {
			const error = parseAndCatch(UNBOUND_PREFIX, mimeType);
			expect(error.locator).toEqual(
				expect.objectContaining({ lineNumber: expect.any(Number), columnNumber: expect.any(Number) })
			);
		});

		test('escalates an onError that throws to a ParseError', () => {
			const error = parseAndCatch(UNBOUND_PREFIX, mimeType, {
				onError: () => {
					throw new Error('from onError');
				},
			});
			expect(error).toBeInstanceOf(ParseError);
		});

		test('onErrorStopParsing leaves the fatalError outcome unchanged', () => {
			// onErrorStopParsing only throws for the `error` level, not `fatalError`,
			// so the fatalError still throws its own ParseError.
			const error = parseAndCatch(UNBOUND_PREFIX, mimeType, { onError: onErrorStopParsing });
			expect(error).toBeInstanceOf(ParseError);
			expect(error.message).toBe(NAMESPACE_MESSAGE);
		});

		test('a valid namespaced document is unaffected (no throw, no onError)', () => {
			const errors = [];
			const parser = new DOMParser({ onError: (level, message) => errors.push([level, message]) });
			const doc = parser.parseFromString('<a:b xmlns:a="urn:x"/>', mimeType);
			expect(doc.documentElement).toBeTruthy();
			expect(errors).toEqual([]);
		});
	});

	// The whole class - not just the unbound-prefix example - is routed the same way.
	test.each([
		['<a:b>', 'NamespaceError'],
		['<a foo:b="c"/>', 'NamespaceError'],
		['<x:a xmlns:x=""/>', 'NamespaceError'],
		['<a/><b/>', 'HierarchyRequestError'],
	])('%s reports a %s through the common prefix in both mimeTypes', (source, causeName) => {
		for (const mimeType of [MIME_TYPE.XML_TEXT, MIME_TYPE.HTML]) {
			const error = parseAndCatch(source, mimeType);
			expect(error).toBeInstanceOf(ParseError);
			expect(error.message).toMatch(/^Error constructing the DOM: /);
			expect(error.cause).toBeInstanceOf(DOMException);
			expect(error.cause.name).toBe(causeName);
		}
	});
});
