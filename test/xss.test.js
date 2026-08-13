'use strict';

/**
 * Scope: a consumer XSS-sanitizer scenario built on xmldom's serialization
 * callback — usage guidance, NOT a weakness in this library.
 *
 *   {@link https://cwe.mitre.org/data/definitions/79.html CWE-79 Cross-site Scripting}
 *
 * CWE-79 is a downstream *impact* and is not normally attributed to an XML
 * library itself; mapping the library's own weaknesses to it is discouraged.
 * This suite shows how a consumer strips dangerous tags/attributes/URL schemes
 * while serializing.
 *
 * See test/README.md for the weakness-scope comment convention.
 */

const { DOMParser } = require('../lib');

const excludeTags = new RegExp(
	'^(?:' +
		[
			'javascript',
			'vbscript',
			'expression',
			'meta',
			'xml',
			'blink',
			'link',
			'script',
			'applet',
			'embed',
			'object',
			'iframe',
			'frame',
			'frameset',
			'ilayer',
			'layer',
			'bgsound',
			'base',
		].join('|') +
		')$',
	'i'
);
const excludeAttrs = /^(?:on|style)/i;
const urlAttrs = /href|src/i;
const invalidURL = /^(data|javascript|vbscript|ftp):/;

function xss(html) {
	const dom = new DOMParser({
		xmlns: { '': 'http://www.w3.org/1999/xhtml' },
	}).parseFromString(html, 'text/html');
	return dom.documentElement.toString(function (node) {
		switch (node.nodeType) {
			case 1: //element
				const tagName = node.tagName;
				if (excludeTags.test(tagName)) {
					return '';
				}
				return node;
			case 2:
				const attrName = node.name;
				if (excludeAttrs.test(attrName)) {
					return null;
				}
				if (urlAttrs.test(attrName)) {
					const value = node.value;
					if (invalidURL.test(value)) {
						return null;
					}
				}
				return node;
			case 3:
				return node;
		}
	});
}

describe('xss test', () => {
	test('documentElement.toString(true, callback)', () => {
		const html = '<div onclick="alert(123)" title="32323"><script>alert(123)</script></div>';

		const actual = xss(html);

		expect(actual).toBe('<div title="32323" xmlns="http://www.w3.org/1999/xhtml"></div>');
	});
});
