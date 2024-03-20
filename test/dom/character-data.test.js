'use strict';

const { describe, test } = require('@jest/globals');
const { CharacterData } = require('../../lib/dom');

describe('CharacterData.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new CharacterData()).toThrow(TypeError);
		});
	});
});
