'use strict';

const { describe, test } = require('@jest/globals');
const { Comment } = require('../../lib/dom');

describe('Comment.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new Comment()).toThrow(TypeError);
		});
	});
});
