'use strict';
// wallaby:file.skip since stacktrace detection is not working in instrumented files

const { LINE_TO_ERROR_INDEX, REPORTED } = require('./reported');
const { getTestParser } = require('../get-test-parser');
const { ParseError } = require('../../lib/sax');
const { DOMParser } = require('../../lib');

describe.each(Object.entries(REPORTED))('%s', (name, { source, level, match, skippedInHtml }) => {
	describe.each(['text/xml', 'text/html'])('with mimeType %s', (mimeType) => {
		const isHtml = mimeType === 'text/html';
		if (isHtml && skippedInHtml) {
			it(`should not be reported`, () => {
				const { errors, parser } = getTestParser();

				parser.parseFromString(source, mimeType);

				expect(errors).toHaveLength(0);
			});
		} else {
			if (level === 'fatalError') {
				it(`should throw ParseError in errorHandler.fatalError`, () => {
					const onError = jest.fn();
					const parser = new DOMParser({ onError });

					expect(() => parser.parseFromString(source, mimeType)).toThrow(ParseError);

					expect(onError).toHaveBeenCalledTimes(1);
				});
			} else {
				it(`should be reported`, () => {
					const { errors, parser } = getTestParser();

					parser.parseFromString(source, mimeType);

					// store the snapshot, so any change in message can be inspected in the git diff
					expect(errors).toMatchSnapshot();
					// if a match has been defined, filter messages
					expect(match ? (errors || []).filter(match) : errors).toHaveLength(1);
				});
				it(`should escalate Error thrown in onError to ParseError`, () => {
					let thrown = [];
					const onError = jest.fn((level, message) => {
						const toThrow = new Error(level + ': ' + message);
						thrown.push(toThrow);
						throw toThrow;
					});
					const { parser } = getTestParser({ onError });

					expect(() => parser.parseFromString(source, mimeType)).toThrow(ParseError);
					expect(thrown.map((error) => toErrorSnapshot(error, 'lib/sax.js'))).toMatchSnapshot();
					match && expect(match(thrown[0].toString())).toBe(true);
				});
			}
		}
	});
});

/**
 * Creates a string from an error that is easily readable in a snapshot
 * - put's the message on one line as first line
 * - picks the first line in the stack trace that is in `libFile`,
 *   and strips absolute paths and character position from that stack entry
 *   as second line. the line number in the stack is converted to the error index
 *   (to make snapshot testing possible even with stryker).
 * @param {Error} error
 * @param {string} libFile the path from the root of the project that should be preserved in the stack
 * @returns {string}
 */
function toErrorSnapshot(error, libFile) {
	const libFileMatch = new RegExp(`\/.*\/(${libFile})`);
	return `${error.message.replace(/([\n\r]+\s*)/g, '||')}\n${error.stack
		.split(/[\n\r]+/)
		// find first line that is from lib/sax.js
		.filter((l) => libFileMatch.test(l))[0]
		// strip of absolute path
		.replace(libFileMatch, '$1')
		// strip of position of character in line
		.replace(/:\d+\)$/, ')')
		// We only store the error index int he snapshot instead of the line numbers.
		// This way they need to be updated less frequent and are compatible with stryker.
		// see `parseErrorLines` in `./reported.js` for how LINE_TO_ERROR_INDEX is created,
		// and `./reported.json` (after running the tests) to inspect it.
		.replace(new RegExp(`${libFile}:\\d+`), (fileAndLine) => {
			return `${libFile}:#${fileAndLine in LINE_TO_ERROR_INDEX ? LINE_TO_ERROR_INDEX[fileAndLine].index : -1}`;
		})}`;
}
