'use strict';
// wallaby:file.skip since stacktrace detection is not working in instrumented files
const { describe, expect, test } = require('@jest/globals');

const path = require('path');
const { LINE_TO_ERROR_INDEX, REPORTED } = require('./reported');
const { MIME_TYPE } = require('../../lib/conventions');
const { DOMParser } = require('../../lib/dom-parser');
const { ParseError } = require('../../lib/sax');
const { getTestParser } = require('../get-test-parser');

describe.each(Object.entries(REPORTED))('%s', (name, { source, level, match, skippedInHtml }) => {
	describe.each([MIME_TYPE.XML_TEXT, MIME_TYPE.HTML])('with mimeType %s', (mimeType) => {
		const isHtml = mimeType === 'text/html';
		if (isHtml && skippedInHtml) {
			test(`should not be reported`, () => {
				const { errors, parser } = getTestParser();

				parser.parseFromString(source, mimeType);

				expect(errors).toHaveLength(0);
			});
		} else {
			if (level === 'fatalError') {
				test(`should throw ParseError in errorHandler.fatalError`, () => {
					const onError = jest.fn();
					const parser = new DOMParser({ onError });

					expect(() => parser.parseFromString(source, mimeType)).toThrow(ParseError);

					expect(onError).toHaveBeenCalled();
				});
			} else {
				test(`should be reported`, () => {
					const { errors, parser } = getTestParser();

					parser.parseFromString(source, mimeType);

					// store the snapshot, so any change in message can be inspected in the git diff
					expect(errors).toMatchSnapshot();
					// if a match has been defined, filter messages
					expect(match ? (errors || []).filter(match) : errors).toHaveLength(1);
				});
				test(`should escalate Error thrown in onError to ParseError`, () => {
					let thrown = [];
					const onError = jest.fn((level, message) => {
						const toThrow = new Error(level + ': ' + message);
						thrown.push(toThrow);
						throw toThrow;
					});
					const { parser } = getTestParser({ onError });

					expect(() => parser.parseFromString(source, mimeType)).toThrow(ParseError);
					expect(thrown.map((error) => toErrorSnapshot(error, path.join('lib', 'sax.js')))).toMatchSnapshot();
					match && expect(match(thrown[0].toString())).toBe(true);
				});
			}
		}
	});
});

/**
 * Creates a string from an error that is easily readable in a snapshot - put's the message on
 * one line as first line - picks the first line in the stack trace that is in `libFile`,
 * and strips absolute paths and character position from that stack entry as second line.
 * the line number in the stack is converted to the error index (to only have relevant changes
 * in snapshots).
 *
 * @param {Error} error
 * @param {string} libFile
 * The path from the root of the project that should be preserved in the stack.
 * @returns {string}
 */
function toErrorSnapshot(error, libFile) {
	// Escape the backslash for Windows paths and make the regex platform independent
	const escapedLibFile = libFile.replace(/\\/g, '\\\\');
	// replace separators in file path to '/' (linux format) for consistent error snapshot
	const unifiedLibFile = libFile.replace(/\\/g, '/');
	const libFileMatch = new RegExp(`[^(]*(${escapedLibFile})`);

	const errorMessageSingleLine = error.message.replace(/([\n\r]+\s*)/g, '||');
	const firstStacktraceLineWithLibFileAbs = error.stack.split(/[\n\r]+/).find((l) => libFileMatch.test(l));
	const firstStacktraceLineWithLibFileRel = firstStacktraceLineWithLibFileAbs.replace(libFileMatch, '$1');
	// strip of position of character in line
	const firstStacktraceLineWithoutPosInLine = firstStacktraceLineWithLibFileRel.replace(/:\d+\)$/, ')');

	const unifiedStacktraceLine = firstStacktraceLineWithoutPosInLine.replace(
		new RegExp(`${escapedLibFile}:\\d+`),
		(fileAndLine) => {
			// We only store the error index in the snapshot instead of the line numbers.
			// This way they need to be updated less frequent.
			// see `parseErrorLines` in `./reported.js` for how LINE_TO_ERROR_INDEX is created,
			// and `./reported.json` (after running the tests) to inspect it.
			return `${unifiedLibFile}:#${fileAndLine in LINE_TO_ERROR_INDEX ? LINE_TO_ERROR_INDEX[fileAndLine].index : -1}`;
		}
	);

	return `${errorMessageSingleLine}\n${unifiedStacktraceLine}`;
}
