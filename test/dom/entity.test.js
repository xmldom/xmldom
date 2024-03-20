'use strict';

const { describe, test } = require('@jest/globals');
const { Entity } = require('../../lib/dom');

describe('Entity.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new Entity()).toThrow(TypeError);
		});
	});
});
