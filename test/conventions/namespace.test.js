'use strict';

const { NAMESPACE } = require('../../lib/conventions');

describe('NAMESPACE', () => {
	Object.keys(NAMESPACE).forEach((key) => {
		const value = NAMESPACE[key];
		test(`should contain immutable ${key} with correct value`, () => {
			expect([key, value]).toMatchSnapshot();
			try {
				NAMESPACE[key] = 'boo';
			} catch {}
			expect(NAMESPACE[key]).toBe(value);
		});
	});
});
