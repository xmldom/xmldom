'use strict';

const { freeze } = require('../../lib/conventions');

describe('freeze', () => {
	test('should return the frozen object (works in node)', () => {
		const input = { k: 'v' };
		const actual = freeze(input);
		expect(actual).toBe(input);

		try {
			actual.k = 0;
			actual.a = 'b';
			delete actual.k;
		} catch {
			// Nothing can be added to or removed from the properties set of a frozen object.
			// Any attempt to do so will fail, either silently or by throwing a TypeError exception
			// (most commonly, but not exclusively, when in strict mode).
		}
		expect(actual).toEqual(input);
	});
	test('should return `input` if `Object.freeze` is not available', () => {
		const input = { k: 'v' };
		const actual = freeze(input, {});
		expect(actual).toBe(input);
	});
	test('should return input if Object is not available', () => {
		const input = { k: 'v' };
		const actual = freeze(input, null);
		expect(actual).toBe(input);
	});
	test('should use the custom ObjectConstructor correctly', () => {
		const input = { k: 'v' };
		const frozen = { ...input };
		const freezeStub = jest.fn(() => frozen);
		const actual = freeze(input, { freeze: freezeStub });
		expect(freezeStub).toHaveBeenCalledWith(input);
		expect(actual).toBe(frozen);
	});
});
