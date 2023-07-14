'use strict';
/** See https://stackoverflow.com/a/488640/684134 methods in this file should make it easier to do that. */
/**
 * @param {string} from
 * @param {string} to
 * @returns {string}
 */
const range = (from, to) => {
	let result = '';
	const start = from.codePointAt(0);
	const end = to.codePointAt(0);
	for (let i = start; i <= end; i++) {
		result += String.fromCodePoint(i);
	}
	return result;
};

/**
 * @param {string} value
 * @returns {string}
 */
const unicode = (value) =>
	`"${value}" (${value
		.split('')
		.map((char) => '\\u' + char.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'))
		.join('')})`;

exports.unicode = unicode;
exports.range = range;
