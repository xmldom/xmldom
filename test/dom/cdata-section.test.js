'use strict';

const { describe, test } = require('@jest/globals');
const { CDATASection } = require('../../lib/dom');

describe('CDATASection.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new CDATASection()).toThrow(TypeError);
		});
	});
});
