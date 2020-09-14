const {replaceNonTextChars} = require('xmltest');

/**
 * Provides minimal representation by not adding empty lists or `expected`
 * to the snapshots.
 *
 * @param actual {string | undefined | {toString: function(): string}}
 * @param errors {Partial<Record<ErrorLevel, string[]>>}
 * @param expected {string?} (optional) compared to actual and only added to output if different
 * @returns {{actual?: string} & Partial<Record<ErrorLevel, string[]>>}
 */
const minimizeSnapshot = (actual, errors, expected) => {
	const actualOutput = replaceNonTextChars(actual);
	const expectedOutput = replaceNonTextChars(expected);
	const partial = {
		actual: actualOutput
	};
	if (expectedOutput && actualOutput !== expectedOutput) {
		partial.expected = expectedOutput
	}
	return {...partial, ...errors};
};

module.exports = {
	minimizeSnapshot
};
