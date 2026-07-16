'use strict';

const { describe, expect, test } = require('@jest/globals');
const { MIME_TYPE } = require('../../lib/conventions');
const { Node } = require('../../lib/dom');
const { DOMParser } = require('../../lib/dom-parser');

const expectNeighbours = (first, second, ...nodes) => {
	expect(first.nextSibling).toStrictEqual(second);
	expect(second.previousSibling).toStrictEqual(first);
	expect(first.parentNode).toStrictEqual(second.parentNode);

	if (nodes.length > 0) {
		expectNeighbours(second, ...nodes);
	}
};

describe('XML Node Parse', () => {
	test('element', () => {
		const dom = new DOMParser().parseFromString('<xml><child/></xml>', MIME_TYPE.XML_TEXT);

		expect(dom.documentElement.nodeType).toStrictEqual(Node.ELEMENT_NODE);
		expect(dom.documentElement.firstChild.nodeType).toStrictEqual(Node.ELEMENT_NODE);
		expect(dom).toMatchObject({
			childNodes: {
				length: 1,
			},
			documentElement: {
				childNodes: {
					length: 1,
				},
				firstChild: {
					nodeName: 'child',
					tagName: 'child',
				},
				nodeName: 'xml',
				tagName: 'xml',
			},
		});
	});

	test('text', () => {
		const { firstChild } = new DOMParser().parseFromString('<xml>start center end</xml>', MIME_TYPE.XML_TEXT).documentElement;

		expect(firstChild.nodeType).toStrictEqual(Node.TEXT_NODE);
		expect(firstChild).toMatchObject({
			data: 'start center end',
			nextSibling: null,
		});
	});

	test('cdata', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml>start <![CDATA[<encoded>]]> end<![CDATA[[[[[[[[[]]]]]]]]]]></xml>',
			MIME_TYPE.XML_TEXT
		);
		expect(documentElement.firstChild).toMatchObject({
			data: 'start ',
			nextSibling: {
				data: '<encoded>',
				nextSibling: {
					nextSibling: {
						data: '[[[[[[[[]]]]]]]]',
					},
				},
			},
		});
	});

	test('cdata empty', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml><![CDATA[]]>start <![CDATA[]]> end</xml>',
			MIME_TYPE.XML_TEXT
		);
		expect(documentElement).toMatchObject({
			textContent: 'start  end',
		});
	});

	test('comment', () => {
		const { documentElement } = new DOMParser().parseFromString('<xml><!-- comment&>< --></xml>', MIME_TYPE.XML_TEXT);

		expect(documentElement.firstChild).toMatchObject({
			nodeValue: ' comment&>< ',
		});
	});

	test('cdata comment', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml>start <![CDATA[<encoded>]]> <!-- comment -->end</xml>',
			MIME_TYPE.XML_TEXT
		);

		expect(documentElement.firstChild).toMatchObject({
			nodeName: '#text', // 0
			nodeValue: 'start ',
			nextSibling: {
				nodeName: '#cdata-section', // 1
				nodeValue: '<encoded>',
				nextSibling: {
					nodeName: '#text', // 2
					nodeValue: ' ',
					nextSibling: {
						nodeName: '#comment', // 3
						nodeValue: ' comment ',
						nextSibling: {
							nodeName: '#text', // 4
							nodeValue: 'end',
						},
					},
				},
			},
		});
	});

	describe('appendChild', () => {
		test('returns the argument', () => {
			const dom = new DOMParser().parseFromString('<xml/>', MIME_TYPE.XML_TEXT);

			const child = dom.createElement('child');

			expect(dom.documentElement.appendChild(child)).toStrictEqual(child);
		});

		test('appends as firstChild', () => {
			const dom = new DOMParser().parseFromString('<xml/>', MIME_TYPE.XML_TEXT);
			const child = dom.createElement('child');

			dom.documentElement.appendChild(child);

			expect(dom.documentElement.firstChild).toStrictEqual(child);
		});
		test('subsequent calls append in order', () => {
			const dom = new DOMParser().parseFromString('<xml />', MIME_TYPE.XML_TEXT);
			const fragment = dom.createDocumentFragment();

			expect(fragment.nodeType).toStrictEqual(Node.DOCUMENT_FRAGMENT_NODE);

			const first = fragment.appendChild(dom.createElement('first'));
			const last = fragment.appendChild(dom.createElement('last'));

			expectNeighbours(first, last);
			expect(fragment.firstChild).toStrictEqual(first);
			expect(fragment.firstElementChild).toStrictEqual(first);
			expect(fragment.firstElementChild.nextElementSibling).toStrictEqual(last);
			expect(fragment.lastChild).toStrictEqual(last);
			expect(fragment.lastElementChild).toStrictEqual(last);
			expect(fragment.lastElementChild.previousElementSibling).toStrictEqual(first);
			expect(fragment.childElementCount).toBe(2);
		});
	});

	describe('insertBefore', () => {
		test('places created element before existing element', () => {
			const dom = new DOMParser().parseFromString('<xml><child/></xml>', MIME_TYPE.XML_TEXT);
			const inserted = dom.createElement('sibling');
			const child = dom.documentElement.firstChild;

			child.parentNode.insertBefore(inserted, child);

			expectNeighbours(inserted, child);
		});
		test('inserts all elements in DocumentFragment', () => {
			const dom = new DOMParser().parseFromString('<xml><child/></xml>', MIME_TYPE.XML_TEXT);
			const child = dom.documentElement.firstChild;

			const fragment = dom.createDocumentFragment();
			const first = fragment.appendChild(dom.createElement('first'));
			const second = fragment.appendChild(dom.createElement('second'));

			const parent = child.parentNode;
			parent.insertBefore(fragment, child);

			expectNeighbours(first, second, child);
			expect(parent.firstChild).toStrictEqual(first);
			expect(parent.childElementCount).toStrictEqual(3);
			expect(parent.firstElementChild).toStrictEqual(first);
			expect(parent.lastElementChild).toStrictEqual(child);
			expect(first.previousElementSibling).toBeNull();
			expect(first.nextElementSibling).toStrictEqual(second);
			expect(second.previousElementSibling).toStrictEqual(first);
			expect(second.nextElementSibling).toStrictEqual(child);
			expect(child.previousElementSibling).toStrictEqual(second);
			expect(child.nextElementSibling).toBeNull();
		});
	});

	test('preserves instruction', () => {
		const source = '<?xml version="1.0"?><root><child>&amp;<!-- &amp; --></child></root>';

		const actual = new DOMParser().parseFromString(source, MIME_TYPE.XML_TEXT).toString();

		expect(actual).toStrictEqual(source);
	});

	test('preserves doctype with public id and sysid', () => {
		const DOCTYPE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`;

		const actual = new DOMParser().parseFromString(`${DOCTYPE}<html/>`, 'text/html').toString();

		expect(actual).toStrictEqual(`${DOCTYPE}<html xmlns="http://www.w3.org/1999/xhtml"></html>`);
	});

	test('preserves doctype with sysid', () => {
		const DOCTYPE = '<!DOCTYPE custom SYSTEM "custom.dtd">';

		const actual = new DOMParser().parseFromString(`${DOCTYPE}<custom/>`, MIME_TYPE.XML_TEXT).toString();

		expect(actual).toStrictEqual(`${DOCTYPE}<custom/>`);
	});
});
