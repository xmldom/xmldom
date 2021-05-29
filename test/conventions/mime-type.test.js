'use strict'

const { MIME_TYPE } = require('../../lib/conventions')

describe('MIME_TYPE', () => {
	Object.keys(MIME_TYPE).forEach((key) => {
		if (key === 'isHTML') {
			describe('isHTML', () => {
				it("should return true for 'text/html'", () => {
					expect(MIME_TYPE.isHTML('text/html')).toBe(true)
				})
				it('should return true for MIME_TYPE.HTML', () => {
					expect(MIME_TYPE.isHTML(MIME_TYPE.HTML)).toBe(true)
				})
				it.each([
					undefined,
					null,
					0,
					1,
					false,
					true,
					'',
					MIME_TYPE.XML_XHTML_APPLICATION,
				])("should return false for '%s'", (value) => {
					expect(MIME_TYPE.isHTML(value)).toBe(false)
				})
			})
		} else {
			const value = MIME_TYPE[key]
			it(`should contain immutable ${key} with correct value`, () => {
				expect([key, value]).toMatchSnapshot()
				try {
					MIME_TYPE[key] = 'boo'
				} catch {}
				expect(MIME_TYPE[key]).toBe(value)
			})
		}
	})
})
