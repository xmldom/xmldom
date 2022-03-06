'use strict'

const {
	HTML_BOOLEAN_ATTRIBUTES,
	isHTMLBooleanAttribute,
	HTML_RAW_TEXT_ELEMENTS,
	isHTMLRawTextElement,
	isHTMLEscapableRawTextElement,
	HTML_VOID_ELEMENTS,
	isHTMLVoidElement,
} = require('../../lib/conventions')

describe('HTML_BOOLEAN_ATTRIBUTES', () => {
	Object.keys(HTML_BOOLEAN_ATTRIBUTES).forEach((key) => {
		const value = HTML_BOOLEAN_ATTRIBUTES[key]
		it(`should contain immutable ${key} with value 'true'`, () => {
			expect([key, value]).toMatchSnapshot()
			try {
				HTML_BOOLEAN_ATTRIBUTES[key] = 'boo'
			} catch {}
			expect(HTML_BOOLEAN_ATTRIBUTES[key]).toBe(value)
		})
	})
})
describe('isHTMLBooleanAttribute', () => {
	Object.keys(HTML_BOOLEAN_ATTRIBUTES).forEach((key) => {
		it(`should detect attribute '${key}'`, () => {
			expect(isHTMLBooleanAttribute(key)).toBe(true)
		})
		const upperKey = key.toUpperCase()
		it(`should detect attribute '${upperKey}'`, () => {
			expect(isHTMLBooleanAttribute(upperKey)).toBe(true)
		})
		const mixedKey = key[0].toUpperCase() + key.substring(1)
		it(`should detect attribute '${mixedKey}'`, () => {
			expect(isHTMLBooleanAttribute(mixedKey)).toBe(true)
		})
	})
	it('should not detect prototype properties', () => {
		expect(isHTMLBooleanAttribute('hasOwnProperty')).toBe(false)
		expect(isHTMLBooleanAttribute('constructor')).toBe(false)
		expect(isHTMLBooleanAttribute('prototype')).toBe(false)
		expect(isHTMLBooleanAttribute('__proto__')).toBe(false)
	})
})
describe('HTML_VOID_ELEMENTS', () => {
	Object.keys(HTML_VOID_ELEMENTS).forEach((key) => {
		const value = HTML_VOID_ELEMENTS[key]
		it(`should contain immutable ${key} with value 'true'`, () => {
			expect([key, value]).toMatchSnapshot()
			try {
				HTML_VOID_ELEMENTS[key] = 'boo'
			} catch {}
			expect(HTML_VOID_ELEMENTS[key]).toBe(true)
		})
	})
})
describe('isHTMLVoidElement', () => {
	Object.keys(HTML_VOID_ELEMENTS).forEach((key) => {
		it(`should detect attribute '${key}'`, () => {
			expect(isHTMLVoidElement(key)).toBe(true)
		})
		const upperKey = key.toUpperCase()
		it(`should detect attribute '${upperKey}'`, () => {
			expect(isHTMLVoidElement(upperKey)).toBe(true)
		})
		const mixedKey = key[0].toUpperCase() + key.substring(1)
		it(`should detect attribute '${mixedKey}'`, () => {
			expect(isHTMLVoidElement(mixedKey)).toBe(true)
		})
	})
	it('should not detect prototype properties', () => {
		expect(isHTMLVoidElement('hasOwnProperty')).toBe(false)
		expect(isHTMLVoidElement('constructor')).toBe(false)
		expect(isHTMLVoidElement('prototype')).toBe(false)
		expect(isHTMLVoidElement('__proto__')).toBe(false)
	})
})
describe('HTML_RAW_TEXT_ELEMENTS', () => {
	Object.keys(HTML_RAW_TEXT_ELEMENTS).forEach((key) => {
		const value = HTML_RAW_TEXT_ELEMENTS[key]
		it(`should contain immutable ${key} with value 'true'`, () => {
			expect([key, value]).toMatchSnapshot()
			try {
				HTML_RAW_TEXT_ELEMENTS[key] = 'boo'
			} catch {}
			expect(HTML_RAW_TEXT_ELEMENTS[key]).toBe(value)
		})
	})
})
describe('isHTMLRawTextElement', () => {
	Object.keys(HTML_RAW_TEXT_ELEMENTS).forEach((key) => {
		it(`should detect attribute '${key}'`, () => {
			expect(isHTMLRawTextElement(key)).toBe(true)
		})
		const upperKey = key.toUpperCase()
		it(`should detect attribute '${upperKey}'`, () => {
			expect(isHTMLRawTextElement(upperKey)).toBe(true)
		})
		const mixedKey = key[0].toUpperCase() + key.substring(1)
		it(`should detect attribute '${mixedKey}'`, () => {
			expect(isHTMLRawTextElement(mixedKey)).toBe(true)
		})
	})
	it('should not detect prototype properties', () => {
		expect(isHTMLRawTextElement('hasOwnProperty')).toBe(false)
		expect(isHTMLRawTextElement('constructor')).toBe(false)
		expect(isHTMLRawTextElement('prototype')).toBe(false)
		expect(isHTMLRawTextElement('__proto__')).toBe(false)
	})
})
describe('isHTMLEscapableRawTextElement', () => {
	Object.keys(HTML_RAW_TEXT_ELEMENTS).forEach((key) => {
		const expected = HTML_RAW_TEXT_ELEMENTS[key]
		it(`should detect attribute '${key}' as ${expected}`, () => {
			expect(isHTMLEscapableRawTextElement(key)).toBe(expected)
		})
		const upperKey = key.toUpperCase()
		it(`should detect attribute '${upperKey}' as ${expected}`, () => {
			expect(isHTMLEscapableRawTextElement(upperKey)).toBe(expected)
		})
		const mixedKey = key[0].toUpperCase() + key.substring(1)
		it(`should detect attribute '${mixedKey}' as ${expected}`, () => {
			expect(isHTMLEscapableRawTextElement(mixedKey)).toBe(expected)
		})
	})
	it('should not detect prototype properties', () => {
		expect(isHTMLEscapableRawTextElement('hasOwnProperty')).toBe(false)
		expect(isHTMLEscapableRawTextElement('constructor')).toBe(false)
		expect(isHTMLEscapableRawTextElement('prototype')).toBe(false)
		expect(isHTMLEscapableRawTextElement('__proto__')).toBe(false)
	})
})
