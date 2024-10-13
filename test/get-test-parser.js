'use strict';
const { DOMParser } = require('../lib/dom-parser');

/**
 * {'warning' | 'error' | 'fatalError'}
 *
 * @typedef ErrorLevel
 */

/**
 * Helper method for configuring an instance of DOMParser.
 * Calling it without any arguments allows to assert on `errors` after using the parser.
 * every field of the first argument is options and allows to specify test specific behavior.
 * - `errorHandler`: The `errorHandler` to pass to DOMParser constructor options,
 * default stores a list of all entries per `key` in `errors` and does not log or throw.
 * - `errors`: the object for the `errorHandler` to use,
 * is also returned with the same name for later assertions,
 * default is an empty object - `locator`: Whether to record node locations in the XML string,
 * default is true.
 *
 * @param options
 * {{
 * onError?: function (level:string, msg:string, context:DOMHandler),
 * errors?: [ErrorLevel, string, object][],
 * locator?: boolean }}
 * @returns {{ parser: DOMParser; errors: [ErrorLevel, string, Object][] }}
 */
function getTestParser({ onError, errors = [], locator = true } = {}) {
	onError =
		onError ||
		((level, msg, { locator }) => {
			errors.push([level, msg, locator]);
		});
	return {
		errors,
		parser: new DOMParser({ onError, locator }),
	};
}

module.exports = {
	getTestParser: getTestParser,
};
