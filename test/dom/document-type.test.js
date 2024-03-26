'use strict';

const { describe, test } = require('@jest/globals');
const { DocumentType } = require('../../lib/dom');

describe('DocumentType.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new DocumentType()).toThrow(TypeError);
		});
	});
});
