'use strict';

const { find } = require('../../lib/conventions');

describe('find', () => {
	test('should work in node without pasing an ArrayConstructor', () => {
		const predicate = jest.fn((item) => item === 'b');
		const list = ['a', 'b', 'c'];

		expect(find(list, predicate)).toBe('b');
		expect(predicate).toHaveBeenCalledTimes(2);
		expect(predicate).toHaveBeenCalledWith('a', 0, list);
		expect(predicate).toHaveBeenCalledWith('b', 1, list);
	});
	test('should work when ArrayConstructor does not provide find', () => {
		const predicate = jest.fn((item) => item === 'b');
		const list = ['a', 'b', 'c'];

		expect(find(list, predicate, {})).toBe('b');
		expect(predicate).toHaveBeenCalledTimes(2);
		expect(predicate).toHaveBeenCalledWith('a', 0, list);
		expect(predicate).toHaveBeenCalledWith('b', 1, list);
	});
});
