/* eslint strict: off */

var node_assert = require('assert')

function isAssertionError(error) {
	return error.name.startsWith('AssertionError')
}

/**
 * Picks the location of the assertion from the stacktrace if available.
 *
 * @param {Error} error
 */
function locateAssertion(error) {
	return (
		(error &&
			error.stack &&
			error.stack
				.split('\n')
				.find((l) => l.includes(__dirname) && !l.includes(__filename))) ||
		'[No stacktrace available]'
	)
}

/**
 * The existing vows testsuite makes heavy use of `console.assert(actual+'' == expected, ...)`.
 * With the assumption that the equivalent call to an assertion method that can fail a test,
 * is `assert(expected == actual, ...)` (the non strict assert using loose equality)
 * this function is provided to solve:
 *
 * - `...` often contains a repetition of `actual` to have it in the test message
 * - we want to make sure `assert.isTrue` is checked to cater for any weird type coercion
 * - we would "prefer" using `assert.isEqual` for better failure message and test maintainability
 * - easy switch to this method by
 *
 * by just making both assertions :)
 * It prefixes each assertion with `(strict ===)` or `(strict ===)`, so it's clear which one fails
 *
 * @param {*} actual The the value returned by the code under test
 * @param {*} expected The expected value
 * @param {...*} messages values to use as assertion message, no need to repeat expected or actual
 * @returns {undefined} if both assertion pass
 * @throws {AssertionError} if one of the assertion fails
 *
 * @see https://nodejs.org/docs/latest-v10.x/api/assert.html#assert_class_assert_assertionerror
 * @see https://nodejs.org/docs/latest-v10.x/api/assert.html#assert_strict_mode
 * @see https://github.com/vowsjs/vows#assertistrueactual-message
 * @see https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html
 */
function assert(actual, expected, ...messages) {
	// in case console.assert gets converted without changing == to ,: fail
	// it makes no sense to call this method with only one boolean argument
	if (typeof actual === 'boolean' && arguments.length === 1)
		throw new Error('convert equal to ,')
	let caught
	// the assertion with the better error message comes first so we can benefit
	try {
		node_assert.strict.equal(actual, expected)
	} catch (error) {
		if (!isAssertionError(error)) throw error
		caught = error
	}
	// the original assertion comes second, it has to always be executed
	node_assert(
		actual == expected,
		['(loose ==)', ...messages, actual, locateAssertion(caught)].join(' ')
	)
	if (caught) {
		const msg = [
			'(strict ===) ',
			...messages,
			caught.message,
			locateAssertion(caught),
		]
		if ((this.strictThrows || assert.strictThrows)()) {
			caught.message = msg.join(' ')
			throw caught
		}
		;(this.log || assert.log)(...msg)
	}
}

assert.log = console.warn
assert.strictThrows = () => process.env.XMLDOM_ASSERT_STRICT || false

/**
 * This is a consistent way of skipping an assertion since it currently fails:
 * Change `assert(exp, act, ...)` to `assert.skip(exp, act, ...)`
 *
 * - it prints something to the output when the assertion fails (like `console.assert`)
 * - it fails if no assertion fails (no more need to skip it, if it's no longer needed, remove it)
 * - it fails if the reason for skipping is not provided
 *
 * @param {*} expected The expected value
 * @param {*} actual The the value returned by the code under test
 * @param {...*} messages values to use as assertion message, no need to repeat expected or actual
 * @returns {undefined} if the assertion fails
 * @throws {AssertionError} if no assertion fails
 */
function skip(actual, expected, ...messages) {
	try {
		assert.apply(this, arguments)
	} catch (error) {
		if (!isAssertionError(error)) {
			throw error
		}
		;(this.log || assert.log)(
			'Skipped assertion fails as expected:\n  ',
			error.message,
			'in',
			locateAssertion(error)
		)
		return
	}
	const error = new Error(
		`Skipped assertion is not failing: '''${messages.join(' ')}'''\n  `
	)
	error.message += locateAssertion(error)
	throw error
}

assert.skip = skip

// provide access to used node assertions to avoid cumbersome duplicate imports
// and avoid forgetting to import .strict methods
assert.fail = node_assert.strict.fail
assert.equal = node_assert.strict.equal
assert.isTrue = (actual) => assert(actual, true)

module.exports = assert
