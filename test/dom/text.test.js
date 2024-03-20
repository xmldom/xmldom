'use strict';

const { describe, test } = require('@jest/globals');
const { Text } = require('../../lib/dom');

describe('Text.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new Text()).toThrow(TypeError);
		});
	});
});
