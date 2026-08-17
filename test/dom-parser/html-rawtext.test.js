'use strict';

const { describe, expect, test } = require('@jest/globals');
const { DOMParser } = require('../../lib/dom-parser');
const { XMLSerializer } = require('../../lib');

const XHTML_NS = 'http://www.w3.org/1999/xhtml';

/**
 * HTML raw-text elements (`script`, `style`, `textarea`, `title`) must match
 * their closing tag case-insensitively, per WHATWG HTML §13.2.5.14, and a missing
 * closing tag must not back-capture prior source (GHSA-6mj3-qw4j-hgrw).
 */
describe('HTML raw-text close-tag matching', () => {
	const parseHTML = (src) => new DOMParser().parseFromString(src, 'text/html');
	const serialize = (node) => new XMLSerializer().serializeToString(node);

	describe.each(['script', 'style', 'textarea', 'title'])('<%s>', (tag) => {
		test('an exact-case closing tag is unchanged', () => {
			const doc = parseHTML('<' + tag + '>a</' + tag + '>');
			expect(serialize(doc)).toStrictEqual('<' + tag + ' xmlns="' + XHTML_NS + '">a</' + tag + '>');
		});

		test('a case-mismatched closing tag closes the element with the bounded raw text', () => {
			const doc = parseHTML('<' + tag + '>a</' + tag.toUpperCase() + '>');
			const els = doc.getElementsByTagName(tag);
			expect(els.length).toBe(1);
			expect(els[0].textContent).toStrictEqual('a');
		});
	});

	test('a missing closing tag does not back-capture prior markup', () => {
		const doc = parseHTML('<div>before<script>tail');
		const script = doc.getElementsByTagName('script')[0];
		expect(script.textContent).not.toContain('before');
		expect(script.textContent).not.toContain('<div>');
	});
});
