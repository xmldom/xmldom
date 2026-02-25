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
	describe('children', () => {
		test('should return only direct element children of the fragment', () => {
			const doc = new DOMParser().parseFromString('<root/>', MIME_TYPE.XML_TEXT);
			const fragment = doc.createDocumentFragment();
			fragment.appendChild(doc.createTextNode('text'));
			fragment.appendChild(doc.createElement('a'));
			fragment.appendChild(doc.createComment('comment'));
			fragment.appendChild(doc.createElement('b'));
			const children = fragment.children;
			expect(children).toHaveLength(2);
			expect(children.item(0).tagName).toBe('a');
			expect(children.item(1).tagName).toBe('b');
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
