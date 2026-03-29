'use strict';

const { describe, expect, test } = require('@jest/globals');
const { CharacterData, DOMImplementation } = require('../../lib/dom');
const { DOMParser, XMLSerializer } = require('../../lib');
const { MIME_TYPE } = require('../../lib/conventions');

describe('CharacterData.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new CharacterData()).toThrow(TypeError);
		});
	});
});

describe('CDATASection mutation vectors produce safe serializer output', () => {
	let doc;
	// Serializes, then re-parses, and returns true if an <injected> element appears in the tree.
	function isInjected(root) {
		const xml = new XMLSerializer().serializeToString(root);
		const reparsed = new DOMParser().parseFromString(xml, MIME_TYPE.XML_TEXT);
		return reparsed.getElementsByTagName('injected').length > 0;
	}

	beforeEach(() => {
		doc = new DOMImplementation().createDocument(null, 'root', null);
	});

	test('appendData introduces "]]>" safely', () => {
		const cdata = doc.createCDATASection('safe');
		doc.documentElement.appendChild(cdata);
		cdata.appendData(']]><injected/>');
		expect(isInjected(doc.documentElement)).toBe(false);
	});

	test('replaceData introduces "]]>" safely', () => {
		const cdata = doc.createCDATASection('safe data');
		doc.documentElement.appendChild(cdata);
		cdata.replaceData(4, 5, ']]><injected/>');
		expect(isInjected(doc.documentElement)).toBe(false);
	});

	test('.data assignment introduces "]]>" safely', () => {
		const cdata = doc.createCDATASection('safe');
		doc.documentElement.appendChild(cdata);
		cdata.data = 'evil]]><injected/>';
		expect(isInjected(doc.documentElement)).toBe(false);
	});

	test('.textContent assignment introduces "]]>" safely', () => {
		const cdata = doc.createCDATASection('safe');
		doc.documentElement.appendChild(cdata);
		cdata.textContent = 'evil]]><injected/>';
		expect(isInjected(doc.documentElement)).toBe(false);
	});
});
