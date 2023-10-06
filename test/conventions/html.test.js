'use strict';

const { describe, test, expect } = require('@jest/globals');
const {
	HTML_BOOLEAN_ATTRIBUTES,
	isHTMLBooleanAttribute,
	HTML_RAW_TEXT_ELEMENTS,
	isHTMLRawTextElement,
	isHTMLEscapableRawTextElement,
	HTML_VOID_ELEMENTS,
	isHTMLVoidElement,
} = require('../../lib/conventions');

describe('HTML_BOOLEAN_ATTRIBUTES', () => {
	Object.keys(HTML_BOOLEAN_ATTRIBUTES).forEach((key) => {
		const value = HTML_BOOLEAN_ATTRIBUTES[key];
		test(`should contain immutable ${key} with value 'true'`, () => {
			expect([key, value]).toMatchSnapshot();
			try {
				HTML_BOOLEAN_ATTRIBUTES[key] = 'boo';
			} catch {}
			expect(HTML_BOOLEAN_ATTRIBUTES[key]).toBe(value);
		});
	});
	test('should not have a prototype', () => {
		expect(HTML_BOOLEAN_ATTRIBUTES).not.toHaveProperty('prototype');
		expect(HTML_BOOLEAN_ATTRIBUTES).not.toHaveProperty('__proto__');
	});
});
describe('isHTMLBooleanAttribute', () => {
	Object.keys(HTML_BOOLEAN_ATTRIBUTES).forEach((key) => {
		test(`should detect attribute '${key}'`, () => {
			expect(isHTMLBooleanAttribute(key)).toBe(true);
		});
		const upperKey = key.toUpperCase();
		test(`should detect attribute '${upperKey}'`, () => {
			expect(isHTMLBooleanAttribute(upperKey)).toBe(true);
		});
		const mixedKey = key[0].toUpperCase() + key.substring(1);
		test(`should detect attribute '${mixedKey}'`, () => {
			expect(isHTMLBooleanAttribute(mixedKey)).toBe(true);
		});
	});
	test('should not detect prototype properties', () => {
		expect(isHTMLBooleanAttribute('hasOwnProperty')).toBe(false);
		expect(isHTMLBooleanAttribute('constructor')).toBe(false);
		expect(isHTMLBooleanAttribute('prototype')).toBe(false);
		expect(isHTMLBooleanAttribute('__proto__')).toBe(false);
	});
});
describe('HTML_VOID_ELEMENTS', () => {
	Object.keys(HTML_VOID_ELEMENTS).forEach((key) => {
		const value = HTML_VOID_ELEMENTS[key];
		test(`should contain immutable ${key} with value 'true'`, () => {
			expect([key, value]).toMatchSnapshot();
			try {
				HTML_VOID_ELEMENTS[key] = 'boo';
			} catch {}
			expect(HTML_VOID_ELEMENTS[key]).toBe(true);
		});
	});
	test('should not have a prototype', () => {
		expect(HTML_VOID_ELEMENTS).not.toHaveProperty('prototype');
		expect(HTML_VOID_ELEMENTS).not.toHaveProperty('__proto__');
	});
});
describe('isHTMLVoidElement', () => {
	Object.keys(HTML_VOID_ELEMENTS).forEach((key) => {
		test(`should detect attribute '${key}'`, () => {
			expect(isHTMLVoidElement(key)).toBe(true);
		});
		const upperKey = key.toUpperCase();
		test(`should detect attribute '${upperKey}'`, () => {
			expect(isHTMLVoidElement(upperKey)).toBe(true);
		});
		const mixedKey = key[0].toUpperCase() + key.substring(1);
		test(`should detect attribute '${mixedKey}'`, () => {
			expect(isHTMLVoidElement(mixedKey)).toBe(true);
		});
	});
	test('should not detect prototype properties', () => {
		expect(isHTMLVoidElement('hasOwnProperty')).toBe(false);
		expect(isHTMLVoidElement('constructor')).toBe(false);
		expect(isHTMLVoidElement('prototype')).toBe(false);
		expect(isHTMLVoidElement('__proto__')).toBe(false);
	});
});
describe('HTML_RAW_TEXT_ELEMENTS', () => {
	Object.keys(HTML_RAW_TEXT_ELEMENTS).forEach((key) => {
		const value = HTML_RAW_TEXT_ELEMENTS[key];
		test(`should contain immutable ${key} with value 'true'`, () => {
			expect([key, value]).toMatchSnapshot();
			try {
				HTML_RAW_TEXT_ELEMENTS[key] = 'boo';
			} catch {}
			expect(HTML_RAW_TEXT_ELEMENTS[key]).toBe(value);
		});
	});
	test('should not have a prototype', () => {
		expect(HTML_RAW_TEXT_ELEMENTS).not.toHaveProperty('prototype');
		expect(HTML_RAW_TEXT_ELEMENTS).not.toHaveProperty('__proto__');
	});
});
describe('isHTMLRawTextElement', () => {
	Object.keys(HTML_RAW_TEXT_ELEMENTS).forEach((key) => {
		const expected = HTML_RAW_TEXT_ELEMENTS[key] === false;
		test(`should detect attribute '${key}' as ${expected}`, () => {
			expect(isHTMLRawTextElement(key)).toBe(expected);
		});
		const upperKey = key.toUpperCase();
		test(`should detect attribute '${upperKey}' as ${expected}`, () => {
			expect(isHTMLRawTextElement(upperKey)).toBe(expected);
		});
		const mixedKey = key[0].toUpperCase() + key.substring(1);
		test(`should detect attribute '${mixedKey}' as ${expected}`, () => {
			expect(isHTMLRawTextElement(mixedKey)).toBe(expected);
		});
	});
	test('should not detect prototype properties', () => {
		expect(isHTMLRawTextElement('hasOwnProperty')).toBe(false);
		expect(isHTMLRawTextElement('constructor')).toBe(false);
		expect(isHTMLRawTextElement('prototype')).toBe(false);
		expect(isHTMLRawTextElement('__proto__')).toBe(false);
	});
});
describe('isHTMLEscapableRawTextElement', () => {
	Object.keys(HTML_RAW_TEXT_ELEMENTS).forEach((key) => {
		const expected = HTML_RAW_TEXT_ELEMENTS[key];
		test(`should detect attribute '${key}' as ${expected}`, () => {
			expect(isHTMLEscapableRawTextElement(key)).toBe(expected);
		});
		const upperKey = key.toUpperCase();
		test(`should detect attribute '${upperKey}' as ${expected}`, () => {
			expect(isHTMLEscapableRawTextElement(upperKey)).toBe(expected);
		});
		const mixedKey = key[0].toUpperCase() + key.substring(1);
		test(`should detect attribute '${mixedKey}' as ${expected}`, () => {
			expect(isHTMLEscapableRawTextElement(mixedKey)).toBe(expected);
		});
	});
	test('should not detect prototype properties', () => {
		expect(isHTMLEscapableRawTextElement('hasOwnProperty')).toBe(false);
		expect(isHTMLEscapableRawTextElement('constructor')).toBe(false);
		expect(isHTMLEscapableRawTextElement('prototype')).toBe(false);
		expect(isHTMLEscapableRawTextElement('__proto__')).toBe(false);
	});
});
