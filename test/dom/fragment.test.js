'use strict';

const { describe, expect, test } = require('@jest/globals');

const { MIME_TYPE } = require('../../lib/conventions');
const { DOMParser } = require('../../lib/dom-parser');
const { DocumentFragment } = require('../../lib');

describe('DOM DocumentFragment', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new DocumentFragment()).toThrow(TypeError);
		});
	});
	// see: http://jsfiddle.net/9Wmh2/1/
	test('append empty fragment', () => {
		const document = new DOMParser().parseFromString('<p id="p"/>', MIME_TYPE.XML_TEXT);
		const fragment = document.createDocumentFragment();
		document.getElementById('p').insertBefore(fragment, null);
		fragment.appendChild(document.createTextNode('a'));
		document.getElementById('p').insertBefore(fragment, null);
		expect(document.toString()).toBe('<p id="p">a</p>');
	});
});
