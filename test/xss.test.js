'use strict';

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
	it('documentElement.toString(true, callback)', () => {
		const html = '<div onclick="alert(123)" title="32323"><script>alert(123)</script></div>';

		const actual = xss(html);

		expect(actual).toBe('<div title="32323" xmlns="http://www.w3.org/1999/xhtml"></div>');
	});
});
