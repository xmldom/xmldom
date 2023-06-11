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
			it(`should not be reported as ${level}`, () => {
				const { errors, parser } = getTestParser();

				parser.parseFromString(source, mimeType);

				// if no report was triggered, the key is not present on `errors`
				expect(errors[level]).toBeUndefined();
			});
		} else {
			it(`should be reported as ${level}`, () => {
				const { errors, parser } = getTestParser();

				parser.parseFromString(source, mimeType);

				const reported = errors[level];
				// store the snapshot, so any change in message can be inspected in the git diff
				expect(reported).toMatchSnapshot();
				// if a match has been defined, filter messages
				expect(match ? (reported || []).filter(match) : reported).toHaveLength(1);
			});
			if (level === 'fatalError') {
				it(`should throw ParseError in errorHandler.fatalError`, () => {
					const parser = new DOMParser();

					expect(() => parser.parseFromString(source, mimeType)).toThrow(ParseError);
				});
			} else if (level === 'error') {
				it(`should not catch Error thrown in errorHandler.${level}`, () => {
					let thrown = [];
					const errorHandler = {
						[level]: jest.fn((message) => {
							const toThrow = new Error(message);
							thrown.push(toThrow);
							throw toThrow;
						}),
					};
					const { parser } = getTestParser({ errorHandler });

					expect(() => parser.parseFromString(source, mimeType)).toThrow(Error);
					expect(thrown.map((error) => toErrorSnapshot(error, 'lib/sax.js'))).toMatchSnapshot();
					match && expect(match(thrown[0].toString())).toBe(true);
				});
			} else if (level === 'warning') {
				it('should escalate Error thrown in errorHandler.warning to errorHandler.error', () => {
					let thrown = [];
					const errorHandler = {
						warning: jest.fn((message) => {
							const toThrow = new Error(message);
							thrown.push(toThrow);
							throw toThrow;
						}),
						error: jest.fn(),
					};
					const { parser } = getTestParser({ errorHandler });

					parser.parseFromString(source, mimeType);

					expect(errorHandler.warning).toHaveBeenCalledTimes(1);
					expect(errorHandler.error).toHaveBeenCalledTimes(1);
					expect(thrown.map((error) => toErrorSnapshot(error, 'lib/sax.js'))).toMatchSnapshot();
					match && expect(match(thrown[0].message)).toBe(true);
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
 *   (to only have relevant changes in snapshots).
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
		// We only store the error index in the snapshot instead of the line numbers.
		// This way they need to be updated less frequent.
		// see `parseErrorLines` in `./reported.js` for how LINE_TO_ERROR_INDEX is created,
		// and `./reported.json` (after running the tests) to inspect it.
		.replace(new RegExp(`${libFile}:\\d+`), (fileAndLine) => {
			return `${libFile}:#${fileAndLine in LINE_TO_ERROR_INDEX ? LINE_TO_ERROR_INDEX[fileAndLine].index : -1}`;
		})}`;
}
