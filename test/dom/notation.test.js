'use strict';

const { describe, test } = require('@jest/globals');
const { Notation } = require('../../lib/dom');

describe('Notation.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new Notation()).toThrow(TypeError);
		});
	});
});
