'use strict';

const { NAMESPACE } = require('../../lib/conventions');

describe('NAMESPACE', () => {
	Object.keys(NAMESPACE).forEach((key) => {
		if (key === 'isHTML') {
			describe('isHTML', () => {
				it('should return true for NAMESPACE.HTML', () => {
					expect(NAMESPACE.isHTML(NAMESPACE.HTML)).toBe(true);
				});
				it("should return true for 'http://www.w3.org/1999/xhtml'", () => {
					expect(NAMESPACE.isHTML('http://www.w3.org/1999/xhtml')).toBe(true);
				});
				it.each([undefined, null, 0, 1, false, true, '', NAMESPACE.XML])("should return false for '%s'", (value) => {
					expect(NAMESPACE.isHTML(value)).toBe(false);
				});
			});
		} else {
			const value = NAMESPACE[key];
			it(`should contain immutable ${key} with correct value`, () => {
				expect([key, value]).toMatchSnapshot();
				try {
					NAMESPACE[key] = 'boo';
				} catch {}
				expect(NAMESPACE[key]).toBe(value);
			});
		}
	});
});
