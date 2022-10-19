'use strict';
const { assign } = require('../../lib/conventions');

describe('assign', () => {
	test.each([null, undefined, true, false, 0, NaN])('should throw when `target` is `%s`', (target) => {
		expect(() => assign(target, {})).toThrow(TypeError);
	});
	test('should return target', () => {
		const target = {};
		expect(assign(target, undefined)).toBe(target);
	});
	test('should copy all enumerable fields from source to target', () => {
		const target = {};
		const source = { a: 'A', 0: 0 };

		assign(target, source);

		expect(target).toEqual(source);
	});
	test('should not copy prototype properties to source', () => {
		const target = {};
		function Clazz(yes) {
			this.yes = yes;
		}
		Clazz.prototype.dont = 5;
		Clazz.prototype.hasOwnProperty = () => true;
		const source = new Clazz(1);

		assign(target, source);

		expect(target).toEqual({ yes: 1 });
	});
	test('should have no issue with null source', () => {
		const target = {};
		assign(target, null);
	});
	test('should have no issue with undefined source', () => {
		const target = {};
		assign(target, undefined);
	});
	test('should override existing keys', () => {
		const target = { key: 4, same: 'same' };
		const source = { key: undefined };

		assign(target, source);

		expect(target).toEqual({ key: undefined, same: 'same' });
	});
});
