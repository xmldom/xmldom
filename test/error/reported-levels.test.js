'use strict'

const { LINE_TO_ERROR_INDEX, REPORTED } = require('./reported')
const { getTestParser } = require('../get-test-parser')
const { ParseError } = require('../../lib/sax')
const { DOMParser } = require('../../lib/dom-parser')

describe.each(Object.entries(REPORTED))(
	'%s',
	(name, { source, level, match, skippedInHtml }) => {
		describe.each(['text/xml', 'text/html'])('with mimeType %s', (mimeType) => {
			const isHtml = mimeType === 'text/html'
			if (isHtml && skippedInHtml) {
				it(`should not be reported as ${level}`, () => {
					const { errors, parser } = getTestParser()

					parser.parseFromString(source, mimeType)

					// if no report was triggered, the key is not present on `errors`
					expect(errors[level]).toBeUndefined()
				})
			} else {
				it(`should be reported as ${level}`, () => {
					const { errors, parser } = getTestParser()

					parser.parseFromString(source, mimeType)

					const reported = errors[level]
					// store the snapshot, so any change in message can be inspected in the git diff
					expect(reported).toMatchSnapshot()
					// if a match has been defined, filter messages
					expect(
						match ? (reported || []).filter(match) : reported
					).toHaveLength(1)
				})
				if (level === 'fatalError') {
					it(`should throw ParseError in errorHandler.fatalError`, () => {
						const parser = new DOMParser()

						expect(() => parser.parseFromString(source, mimeType)).toThrow(
							ParseError
						)
					})
				} else if (level === 'error') {
					it(`should not catch Error thrown in errorHandler.${level}`, () => {
						let thrown = []
						const errorHandler = {
							[level]: jest.fn((message) => {
								const toThrow = new Error(message)
								thrown.push(toThrow)
								throw toThrow
							}),
						}
						const { parser } = getTestParser({ errorHandler })

						expect(() => parser.parseFromString(source, mimeType)).toThrow(
							Error
						)
						expect(thrown.map(toErrorSnapshot)).toMatchSnapshot()
						match && expect(match(thrown[0].toString())).toBe(true)
					})
				} else if (level === 'warning') {
					it('should escalate Error thrown in errorHandler.warning to errorHandler.error', () => {
						let thrown = []
						const errorHandler = {
							warning: jest.fn((message) => {
								const toThrow = new Error(message)
								thrown.push(toThrow)
								throw toThrow
							}),
							error: jest.fn(),
						}
						const { parser } = getTestParser({ errorHandler })

						parser.parseFromString(source, mimeType)

						expect(errorHandler.warning).toHaveBeenCalledTimes(1)
						expect(errorHandler.error).toHaveBeenCalledTimes(1)
						expect(thrown.map(toErrorSnapshot)).toMatchSnapshot()
						match && expect(match(thrown[0].message)).toBe(true)
					})
				}
			}
		})
	}
)

/**
 * Creates a string from an error that is easily readable in a snapshot
 * - put's the message on one line as first line
 * - picks the first line in the stack trace that is in `lib/sax.js`,
 *   and strips absolute paths and character position from that stack entry
 *   as second line. the line number in the stack is converted to the error index
 *   (to make snapshot testing possible even with stryker).
 * @param {Error} error
 * @returns {string}
 */
function toErrorSnapshot(error) {
	const libSaxMatch = /\/.*\/(lib\/sax\.js)/
	return `${error.message.replace(/([\n\r]+\s*)/g, '||')}\n${error.stack
		.split(/[\n\r]+/)
		// find first line that is from lib/sax.js
		.filter((l) => libSaxMatch.test(l))[0]
		// strip of absolute path
		.replace(libSaxMatch, '$1')
		// strip of position of character in line
		.replace(/:\d+\)$/, ')')
		// since stryker mutates the code, line numbers in the stack trace will change
		// and no longer match the ones in the snapshots.
		// So we map line numbers to an "error index" meaning "the nth thing reported by lib/sax.js"
		// `./reported.js` creates that index on every test run
		// and writes it `./report.json` on every run, for later inspection.
		.replace(/(lib\/sax\.js:)\d+/, (fileAndLine, file) => {
			return `${file}#${
				fileAndLine in LINE_TO_ERROR_INDEX
					? LINE_TO_ERROR_INDEX[fileAndLine].index
					: -1
			}`
		})}`
}
