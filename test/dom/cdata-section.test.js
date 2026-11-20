'use strict';

const { describe, expect, test } = require('@jest/globals');
const { CDATASection, DOMImplementation } = require('../../lib/dom');
const { DOMParser } = require('../../lib');
const { MIME_TYPE } = require('../../lib/conventions');
const { expectDOMException } = require('../errors/expectDOMException');

describe('CDATASection.prototype', () => {
	describe('constructor', () => {
		test('should throw Illegal constructor TypeError when trying to access constructor directly', () => {
			expect(() => new CDATASection()).toThrow(TypeError);
		});
	});
});

describe('Document.prototype.createCDATASection', () => {
	let doc;
	beforeEach(() => {
		const impl = new DOMImplementation();
		doc = impl.createDocument(null, 'xml');
	});

	describe('throws InvalidCharacterError', () => {
		test('when data is exactly "]]>"', () => {
			expectDOMException(() => doc.createCDATASection(']]>'), 'InvalidCharacterError');
		});

		test('when data starts with safe content then contains "]]>"', () => {
			expectDOMException(() => doc.createCDATASection('safe]]>data'), 'InvalidCharacterError');
		});

		test('when data contains multiple "]]>" occurrences', () => {
			expectDOMException(() => doc.createCDATASection('before]]>after]]>after'), 'InvalidCharacterError');
		});
	});

	describe('HTML documents', () => {
		test.each(['', 'safe', ']]>', 'before]]>after'])('throws NotSupportedError for %p', (data) => {
			const htmlDoc = new DOMImplementation().createHTMLDocument('title');
			expectDOMException(() => htmlDoc.createCDATASection(data), 'NotSupportedError');
		});

		test('also rejects creation on a parsed HTML document', () => {
			const htmlDoc = new DOMParser().parseFromString('<html></html>', MIME_TYPE.HTML);
			expectDOMException(() => htmlDoc.createCDATASection('safe'), 'NotSupportedError');
		});

		test('allows creation on an XHTML document', () => {
			const xhtmlDoc = new DOMParser().parseFromString('<html></html>', MIME_TYPE.XML_XHTML_APPLICATION);
			const cdata = xhtmlDoc.createCDATASection('safe');
			expect(cdata.data).toBe('safe');
			expect(cdata.ownerDocument).toBe(xhtmlDoc);
		});
	});

	describe('does not throw', () => {
		test('when data is safe', () => {
			expect(() => doc.createCDATASection('safe')).not.toThrow();
		});

		test('when data is empty string', () => {
			expect(() => doc.createCDATASection('')).not.toThrow();
		});
	});

	describe('parse path', () => {
		test('parsing XML containing a CDATA section does not throw', () => {
			expect(() => new DOMParser().parseFromString('<root><![CDATA[some data]]></root>', MIME_TYPE.XML_TEXT)).not.toThrow();
		});
	});
});
