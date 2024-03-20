'use strict';

const { describe, test } = require('@jest/globals');
const { EntityReference } = require('../../lib/dom');

describe('EntityReference.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new EntityReference()).toThrow(TypeError);
		});
	});
});
