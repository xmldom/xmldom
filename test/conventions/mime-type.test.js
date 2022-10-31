'use strict';

const { hasDefaultHTMLNamespace, isHTMLMimeType, isValidMimeType, MIME_TYPE } = require('../../lib/conventions');

describe('isHTMLMimeType', () => {
	it("should return true for 'text/html'", () => {
		expect(isHTMLMimeType('text/html')).toBe(true);
	});
	it('should return true for MIME_TYPE.HTML', () => {
		expect(isHTMLMimeType(MIME_TYPE.HTML)).toBe(true);
	});
	it.each([undefined, null, 0, 1, false, true, '', MIME_TYPE.XML_XHTML_APPLICATION])("should return false for '%s'", (value) => {
		expect(isHTMLMimeType(value)).toBe(false);
	});
});
describe('hasDefaultHTMLNamespace', () => {
	it("should return true for 'text/html'", () => {
		expect(hasDefaultHTMLNamespace('text/html')).toBe(true);
	});
	it('should return true for MIME_TYPE.HTML', () => {
		expect(hasDefaultHTMLNamespace(MIME_TYPE.HTML)).toBe(true);
	});
	it("should return true for 'application/xhtml+xml'", () => {
		expect(hasDefaultHTMLNamespace('application/xhtml+xml')).toBe(true);
	});
	it('should return true for MIME_TYPE.HTML', () => {
		expect(hasDefaultHTMLNamespace(MIME_TYPE.XML_XHTML_APPLICATION)).toBe(true);
	});
	it.each([undefined, null, 0, 1, false, true, ''])("should return false for '%s'", (value) => {
		expect(hasDefaultHTMLNamespace(value)).toBe(false);
	});
});
describe('MIME_TYPE', () => {
	Object.keys(MIME_TYPE).forEach((key) => {
		const mimeType = MIME_TYPE[key];
		it(`should contain immutable ${key} with correct value`, () => {
			expect([key, mimeType]).toMatchSnapshot();
			try {
				MIME_TYPE[key] = 'boo';
			} catch {}
			expect(MIME_TYPE[key]).toBe(mimeType);
		});
		it(`should be a valid mimeType`, () => {
			expect(isValidMimeType(mimeType)).toBe(true);
		});
	});
});
