const {replaceNonTextChars} = require('xmltest');

/**
 * Provides minimal representation by not adding empty lists or `expected`
 * to the snapshots.
 *
 * @param actual {string | undefined | {toString: function(): string}}
 * @param errors {Partial<Record<ErrorLevel, string[]>>}
 * @param expected {string | undefined}
 * @returns {{actual: string} & Partial<Record<ErrorLevel, string[]>>}
 */
const minimizeSnapshot = (actual, errors, expected) => {
	const actualOutput = replaceNonTextChars(actual);
	const partial = expected && actual === expected
		? {}
		: {actual: actualOutput};
	const results = {...partial, ...errors};
	return Object.keys(results).length === 0 ? {actual: actualOutput} : results;
};

module.exports = {
	minimizeSnapshot
};
