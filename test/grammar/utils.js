'use strict';
/**
 * See https://stackoverflow.com/a/488640/684134
 * methods in this file should make it easier to do that.
 */
/**
 *
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

exports.range = range;
