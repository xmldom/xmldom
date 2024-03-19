'use strict';

const { describe, test } = require('@jest/globals');
const { Attr } = require('../../lib/dom');

describe('Attr.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(new Attr("attr")).toThrow('Illegal constructor');
		});
	});
});
