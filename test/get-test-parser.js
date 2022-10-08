'use strict'
const { DOMParser } = require('../lib/dom-parser')

/**
 * @typedef ErrorLevel {'warn' | 'error' | 'fatalError'}
 */

/**
 * Helper method for configuring an instance of DOMParser.
 * Calling it without any arguments allows to assert on `errors` after using the parser.
 * every field of the first argument is options and allows to specify test specific behavior.
 * - `errorHandler`: The `errorHandler` to pass to DOMParser constructor options,
 * 									default stores a list of all entries per `key` in `errors` and does not log or throw.
 * - `errors`: the object for the `errorHandler` to use,
 * 						is also returned with the same name for later assertions,
 * 						default is an empty object
 * - `locator`: Whether to record node locations in the XML string, default is true
 *
 * @param options {{
 * 					errorHandler?: function (key: ErrorLevel, msg: string)
 * 				  							| Partial<Record<ErrorLevel, function(msg:string)>>,
 * 					errors?: Partial<Record<ErrorLevel, string[]>>,
 * 					locator?: boolean
 *				}}
 * @returns {{parser: DOMParser, errors: Partial<Record<ErrorLevel, string[]>>}}
 */
function getTestParser({ errorHandler, errors = {}, locator = true } = {}) {
	errorHandler =
		errorHandler ||
		((key, msg) => {
			if (!errors[key]) errors[key] = []
			errors[key].push(msg)
		})
	return {
		errors,
		parser: new DOMParser({ errorHandler, locator }),
	}
}

module.exports = {
	getTestParser: getTestParser,
}
