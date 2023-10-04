'use strict';

const { expect } = require('@jest/globals');
const { DOMException } = require('../../lib/errors');

function expectDOMException(fun, name, messageMatch) {
	let caught = null;
	function wrapper() {
		try {
			fun();
		} catch (err) {
			if (err instanceof DOMException) {
				caught = err;
			}
			throw err;
		}
	}
	expect(wrapper).toThrow(DOMException);
	expect(caught).toHaveProperty('name', name);
	messageMatch && expect(caught.message).toMatch(messageMatch);
}

exports.expectDOMException = expectDOMException;
