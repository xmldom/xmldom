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
	let comparable = expected && actual === expected
		? {}
		: expected === undefined
			? {actual}
			: {actual, expected: replaceNonTextChars(expected)};
	comparable = {...comparable, ...errors};
	return Object.keys(comparable).length === 0 ? {actual} : comparable;
};

module.exports = {
	minimizeSnapshot
};
