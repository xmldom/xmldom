'use strict';

const { replaceNonTextChars } = require('xmltest');

/**
 * Generate minimal snapshot representation by not adding empty lists to the
 * snapshots.
 *
 * @param actual {string | undefined | {toString: function(): string}}
 * @param errors {Partial<Record<ErrorLevel, string[]>>}
 * @param expected {string?} (optional) compared to actual-only added to output if different
 * @returns {{actual?: string} & Partial<Record<ErrorLevel, string[]>>}
 */
const generateSnapshot = (actual, errors, expected) => {
	const actualForSnapshot = replaceNonTextChars(actual);
	const expectedForSnapshot = replaceNonTextChars(expected);
	const partial = {
		actual: actualForSnapshot,
	};
	if (expectedForSnapshot && actualForSnapshot !== expectedForSnapshot) {
		partial.expected = expectedForSnapshot;
	}
	return { ...partial, ...errors };
};

module.exports = {
	generateSnapshot,
};
