'use strict'

const { DOMParser, normalizeLineEndings } = require('../../lib/dom-parser')
const { MIME_TYPE } = require('../../lib/conventions')
const whitespaceToHex = (str) =>
	str.replace(/\s/g, (c) => `#x${c.charCodeAt(0).toString(16)}`)

describe('DOMParser constructor option normalizeLineEndings', () => {
	it('should apply the exported function by default', () => {
		const parser = new DOMParser()
		const actual = parser.parseFromString(
			'\r\n \r \u0085<xml/>',
			MIME_TYPE.XML_TEXT
		)

		expect(whitespaceToHex(actual.firstChild.nodeValue)).toBe(
			'#xa#x20#xa#x20#xa'
		)
	})

	it('should use the provided normalizeLineEndings option', () => {
		const mockNormalize = jest.fn(() => '<replacement/>')
		const actual = new DOMParser({
			normalizeLineEndings: mockNormalize,
		}).parseFromString('<xml/>', MIME_TYPE.XML_TEXT)

		expect(mockNormalize).toHaveBeenCalled()
		expect(actual.documentElement.tagName).toBe('replacement')
	})
})

describe('normalizeLineEndings', () => {
	it('should normalize the two-character sequence #xD #xA (aka "\\r\\n")', () => {
		expect(whitespaceToHex(normalizeLineEndings('\r\n'))).toBe('#xa')
		expect(whitespaceToHex(normalizeLineEndings('\x0D\x0A'))).toBe('#xa')
	})

	it('should normalize the two-character sequence #xD #x85', () => {
		expect(whitespaceToHex(normalizeLineEndings('\r\u0085'))).toBe('#xa')
	})

	it('should normalize the single character #x85', () => {
		expect(whitespaceToHex(normalizeLineEndings('\u0085'))).toBe('#xa')
	})

	it('should normalize the single character #x2028', () => {
		expect(whitespaceToHex(normalizeLineEndings('\u2028'))).toBe('#xa')
	})

	it('should normalize any #xD character that is not immediately followed by #xA or #x85', () => {
		expect(whitespaceToHex(normalizeLineEndings('\r \n'))).toBe('#xa#x20#xa')
		expect(whitespaceToHex(normalizeLineEndings(' \r\r'))).toBe('#x20#xa#xa')
	})
})
