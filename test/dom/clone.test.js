'use strict';

const { describe, expect, test } = require('@jest/globals');
const { MIME_TYPE } = require('../../lib/conventions');
const { XMLSerializer } = require('../../lib/dom');
const { DOMParser } = require('../../lib/dom-parser');

describe('XML Namespace Parse', () => {
	test('can properly set clone', () => {
		const doc1 = new DOMParser().parseFromString(
			"<doc1 attr1='1' attr2='a2'>text1<child>text2</child></doc1>",
			MIME_TYPE.XML_TEXT
		);
		const doc1s = new XMLSerializer().serializeToString(doc1);
		const n = doc1.cloneNode(true);
		expect(n.toString()).toBe(doc1s.toString());
	});

	test('can properly import', () => {
		const doc1 = new DOMParser().parseFromString("<doc2 attr='2'/>", MIME_TYPE.XML_TEXT);
		const doc2 = new DOMParser().parseFromString(
			"<doc1 attr1='1' attr2='a2'>text1<child>text2</child></doc1>",
			MIME_TYPE.XML_TEXT
		);

		const doc3 = new DOMParser().parseFromString(
			"<doc2 attr='2'><doc1 attr1='1' attr2='a2'>text1<child>text2</child></doc1></doc2>",
			MIME_TYPE.XML_TEXT
		);
		const n = doc1.importNode(doc2.documentElement, true);
		doc1.documentElement.appendChild(n);
		expect(doc1.toString()).toBe(doc3.toString());
		expect(doc2.toString()).not.toBe(doc3.toString());
	});
});
