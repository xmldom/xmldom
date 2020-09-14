const {replaceNonTextChars} = require('xmltest');

/**
 * Provides minimal representation by not adding empty lists to the snapshot.
 * `expected` will only be added if it is provided.
 *
 * @param actualIn {string | undefined | {toString: function(): string}}
 * @param errors {Partial<Record<ErrorLevel, string[]>>}
 * @param expected {string | undefined}
 * @returns {{actual: string, expected?: string} & Partial<Record<ErrorLevel, string[]>>}
 */
const minimizeSnapshot = (actualIn, errors, expected) => {
	const actual = replaceNonTextChars(actualIn);
	const partial = expected && actual === expected
		? {}
		: expected === undefined
			? {actual}
			: {actual, expected: replaceNonTextChars(expected)};
	const results = {...partial, ...errors};
	return Object.keys(results).length === 0 ? {actual} : results;
};

module.exports = {
	minimizeSnapshot
};
