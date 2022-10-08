'use strict'

const { ParseError } = require('../../lib/sax')
const { __DOMHandler, DOMParser } = require('../../lib/dom-parser')

/**
 * All methods implemented on the DOMHandler prototype.
 *
 * @type {string[]}
 */
const DOMHandlerMethods = Object.keys(__DOMHandler.prototype).sort()

/**
 * XMLReader is currently not calling all methods "implemented" by DOMHandler (some are just empty),
 * If this changes the first test will fail.
 *
 * @type {Set<string>}
 */
const UNCALLED_METHODS = new Set([
	'attributeDecl',
	'elementDecl',
	'endEntity',
	'externalEntityDecl',
	'getExternalSubset',
	'ignorableWhitespace',
	'internalEntityDecl',
	'notationDecl',
	'resolveEntity',
	'skippedEntity',
	'startEntity',
	'unparsedEntityDecl',
])

/**
 * Some of the methods DOMParser/XMLReader call during parsing are not guarded by try/catch,
 * hence an error happening in those will stop the parsing process.
 * There is a test to verify this error handling.
 * If it changes this list might need to be changed as well
 *
 * @type {Set<string>}
 */
const UNCAUGHT_METHODS = new Set([
	'characters',
	'endDocument',
	'error',
	'setDocumentLocator',
	'startDocument',
])

function noop() {}

/**
 * A subclass of DOMHandler that mocks all methods for later inspection.
 * As part of the constructor it can be told which method is supposed to throw an error
 * and which error constructor to use.
 *
 * The `methods` property provides the list of all mocks.
 */
function StubDOMHandlerWith(throwingMethod, ErrorClass) {
	class StubDOMHandler extends __DOMHandler {}
	StubDOMHandler.methods = DOMHandlerMethods.map((method) => {
		const impl = jest.fn(
			method === throwingMethod
				? () => {
						throw new (ErrorClass || ParseError)(
							`StubDOMHandler throwing in ${throwingMethod}`
						)
				  }
				: noop()
		)
		impl.mockName(method)
		StubDOMHandler.prototype[method] = impl
		return impl
	})
	return StubDOMHandler
}

/**
 * This sample is triggering all method calls from XMLReader to DOMHandler at least once.
 * This is verified in a test.
 *
 * There is of course no guarantee that it triggers all the places where XMLReader calls DOMHandler.
 * For example not all possible warning and error cases are present in this file,
 * but some, so that the methods are triggered.
 * For testing all the cases of the different error levels,
 * there are samples per case in
 * @see REPORTED
 */
const ALL_METHODS = `<?xml ?>
<!DOCTYPE name >
<![CDATA[ raw ]]>
<root xmlns="namespace">
  <!-- -->
  <element xmlns:x="http://test" x:a="" warning>
    character
  </element>
  <element duplicate="" duplicate="fatal"></mismatch>
</root>
<!--
`

describe('methods called in DOMHandler', () => {
	it('should call "all possible" methods when using StubDOMHandler', () => {
		const domHandler = StubDOMHandlerWith()
		const parser = new DOMParser({ domHandler, locator: true })
		expect(domHandler.methods).toHaveLength(DOMHandlerMethods.length)

		parser.parseFromString(ALL_METHODS)

		const uncalledMethodNames = domHandler.methods
			.filter((m) => m.mock.calls.length === 0)
			.map((m) => m.getMockName())
		expect(uncalledMethodNames).toEqual([...UNCALLED_METHODS.values()].sort())
	})
	describe.each(DOMHandlerMethods.filter((m) => !UNCALLED_METHODS.has(m)))(
		'when DOMHandler.%s throws',
		(throwing) => {
			it('should not catch ParserError', () => {
				const domHandler = StubDOMHandlerWith(throwing, ParseError)
				const parser = new DOMParser({ domHandler, locator: true })

				expect(() => parser.parseFromString(ALL_METHODS)).toThrow(ParseError)
			})
			const isUncaughtMethod = UNCAUGHT_METHODS.has(throwing)
			it(`${
				isUncaughtMethod ? 'does not' : 'should'
			} catch other Error`, () => {
				const domHandler = StubDOMHandlerWith(throwing, Error)
				const parser = new DOMParser({ domHandler, locator: true })

				if (isUncaughtMethod) {
					expect(() => parser.parseFromString(ALL_METHODS)).toThrow()
				} else {
					expect(() => parser.parseFromString(ALL_METHODS)).not.toThrow()
				}
			})
		}
	)
})
