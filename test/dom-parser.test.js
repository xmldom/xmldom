'use strict';

const { describe, expect, test } = require('@jest/globals');
const { DOMParser, XMLSerializer } = require('../lib');
const { assign, MIME_TYPE, NAMESPACE } = require('../lib/conventions');
const { __DOMHandler, onErrorStopParsing, onWarningStopParsing } = require('../lib/dom-parser');
const { ParseError } = require('../lib/errors');
const { getTestParser } = require('./get-test-parser');

const NS_CUSTOM = 'custom-default-ns';

describe('DOMParser', () => {
	describe('constructor', () => {
		test('should store passed options.locator', () => {
			const options = { locator: {} };
			const it = new DOMParser(options);

			const doc = it.parseFromString('<xml/>', MIME_TYPE.XML_TEXT);

			const expected = {
				columnNumber: 1,
				lineNumber: 1,
			};
			expect(doc.documentElement).toMatchObject(expected);
		});
		test('should use locator when options is not passed', () => {
			const it = new DOMParser();

			const doc = it.parseFromString('<xml/>', MIME_TYPE.XML_TEXT);

			const expected = {
				columnNumber: 1,
				lineNumber: 1,
			};
			expect(doc.documentElement).toMatchObject(expected);
		});
		test("should not use locator when it's not set in options", () => {
			const options = {};
			const it = new DOMParser(options);

			const doc = it.parseFromString('<xml/>', MIME_TYPE.XML_TEXT);

			expect(doc.documentElement).not.toHaveProperty('columnNumber');
			expect(doc.documentElement).not.toHaveProperty('lineNumber');
		});

		test('should set the default namespace to null by default', () => {
			const options = { xmlns: {} };
			const it = new DOMParser(options);

			const doc = it.parseFromString('<xml/>', MIME_TYPE.XML_TEXT);

			expect(doc.documentElement.namespaceURI).toBeNull();
		});

		test('should not use a reference of the xmlns option and not have a prototype', () => {
			const options = { xmlns: { test: 'a' } };
			const it = new DOMParser(options);

			expect(it.xmlns).toEqual(options.xmlns);
			expect(it.xmlns).not.toHaveProperty('__proto__');
			expect(it.xmlns).not.toHaveProperty('prototype');
			options.xmlns.test = 'b';
			expect(it.xmlns.test).toBe('a');
		});

		test('should store passed options.xmlns for default mime type', () => {
			const xmlns = { '': NS_CUSTOM };
			const options = { xmlns };
			const it = new DOMParser(options);

			const actual = it.parseFromString('<xml/>', MIME_TYPE.XML_TEXT);

			expect(actual.toString()).toBe('<xml xmlns="custom-default-ns"/>');
			expect(actual.documentElement.namespaceURI).toBe(NS_CUSTOM);
		});

		test('should store and modify passed options.xmlns for html mime type', () => {
			const xmlns = { '': NS_CUSTOM };
			const it = new DOMParser({ xmlns });

			const doc = it.parseFromString('<xml/>', MIME_TYPE.HTML);

			expect(doc.documentElement.namespaceURI).toBe(NAMESPACE.HTML);
			expect(xmlns['']).toBe(NS_CUSTOM);
		});

		test('should not store the default namespace for html mime type', () => {
			const xmlns = {};
			const it = new DOMParser({ xmlns });

			const doc = it.parseFromString('<xml/>', MIME_TYPE.HTML);

			expect(doc.documentElement.namespaceURI).toBe(NAMESPACE.HTML);
			expect(xmlns).not.toHaveProperty('');
			expect(it.xmlns).not.toHaveProperty('');
		});

		test('should not store default namespace for XHTML mime type', () => {
			const xmlns = {};
			const it = new DOMParser({ xmlns });

			const doc = it.parseFromString('<xml/>', MIME_TYPE.XML_XHTML_APPLICATION);

			expect(doc.documentElement.namespaceURI).toBe(NAMESPACE.HTML);
			expect(xmlns).not.toHaveProperty('');
			expect(it.xmlns).not.toHaveProperty('');
		});

		test('should override default namespace for XHTML mime type', () => {
			const xmlns = { '': NS_CUSTOM };
			const it = new DOMParser({ xmlns });

			const doc = it.parseFromString('<xml/>', MIME_TYPE.XML_XHTML_APPLICATION);

			expect(doc.documentElement.namespaceURI).toBe(NAMESPACE.HTML);
			expect(xmlns['']).toBe(NS_CUSTOM);
		});
		describe('property assign', () => {
			test('should use `options.assign` when passed', () => {
				const stub = (t) => t;
				const it = new DOMParser({ assign: stub });

				expect(it.assign).toBe(stub);
			});

			test('should use `conventions.assign` when `options.assign` is undefined', () => {
				expect(Object.assign).toBeDefined();
				const it = new DOMParser({ assign: undefined });

				expect(it.assign).toBe(assign);
			});

			test('should use `conventions.assign` when `options` is undefined', () => {
				expect(Object.assign).toBeDefined();
				const it = new DOMParser();

				expect(it.assign).toBe(assign);
			});
		});
		describe('property onError', () => {
			test('should be passed to DOMHandler and called for level warning', () => {
				const onError = jest.fn();
				const parser = new DOMParser({ onError });

				parser.parseFromString('<xml attr />', MIME_TYPE.XML_TEXT);

				expect(onError).toHaveBeenCalledTimes(1);
				expect(onError).toHaveBeenCalledWith('warning', expect.stringContaining('attribute'), expect.any(__DOMHandler));
			});
			test('should be passed to DOMHandler and called for level error', () => {
				const onError = jest.fn();
				const parser = new DOMParser({ onError });

				parser.parseFromString(`<xml>&e;</xml>`, MIME_TYPE.XML_TEXT);

				expect(onError).toHaveBeenCalledWith('error', expect.stringContaining('entity'), expect.any(__DOMHandler));
				expect(onError).toHaveBeenCalledTimes(1);
			});
			test('should be passed to DOMHandler and called for level fatalError', () => {
				const onError = jest.fn();
				const parser = new DOMParser({ onError });

				expect(() => parser.parseFromString('', MIME_TYPE.XML_TEXT)).toThrow(ParseError);

				expect(onError).toHaveBeenCalledTimes(1);
				expect(onError).toHaveBeenCalledWith('fatalError', expect.stringContaining('root'), expect.any(__DOMHandler));
			});
			test('should throw for level error when using onErrorStopParsing', () => {
				const onError = jest.fn(onErrorStopParsing);
				const parser = new DOMParser({ onError });

				// warning
				expect(() => parser.parseFromString('<xml attr />', MIME_TYPE.XML_TEXT)).not.toThrow(ParseError);
				expect(onError).toBeCalledTimes(1);
				expect(onError).toHaveBeenCalledWith('warning', expect.anything(), expect.anything());
				// error
				expect(() => parser.parseFromString('<xml>&e;</xml>', MIME_TYPE.XML_TEXT)).toThrow(ParseError);
				expect(onError).toBeCalledTimes(2);
				expect(onError).toHaveBeenCalledWith('error', expect.anything(), expect.anything());
				// fatalError
				expect(() => parser.parseFromString('', MIME_TYPE.XML_TEXT)).toThrow(ParseError);
				expect(onError).toBeCalledTimes(3);
				expect(onError).toHaveBeenCalledWith('fatalError', expect.anything(), expect.anything());
			});
			test('should throw for level error when using onWarningStopParsing', () => {
				const onError = jest.fn(onWarningStopParsing);
				const parser = new DOMParser({ onError });

				// warning
				expect(() => parser.parseFromString('<xml attr />', MIME_TYPE.XML_TEXT)).toThrow(ParseError);
				expect(onError).toBeCalledTimes(1);
				expect(onError).toHaveBeenCalledWith('warning', expect.anything(), expect.anything());
				// error
				expect(() => parser.parseFromString('<xml>&e;</xml>', MIME_TYPE.XML_TEXT)).toThrow(ParseError);
				expect(onError).toBeCalledTimes(2);
				expect(onError).toHaveBeenCalledWith('error', expect.anything(), expect.anything());
				// fatalError
				expect(() => parser.parseFromString('', MIME_TYPE.XML_TEXT)).toThrow(ParseError);
				expect(onError).toBeCalledTimes(3);
				expect(onError).toHaveBeenCalledWith('fatalError', expect.anything(), expect.anything());
			});
			test('should throw when errorHandler is not a function', () => {
				expect(() => new DOMParser({ errorHandler: {} })).toThrow(TypeError);
			});
			test('should warn when errorHandler is a function', () => {
				var errorHandler = jest.fn();
				new DOMParser({ errorHandler });

				expect(errorHandler).toBeCalledWith('warning', expect.stringContaining('onError'), expect.anything());
			});
		});
	});

	describe('parseFromString', () => {
		test('should throw on missing mime type', () => {
			expect(() => new DOMParser().parseFromString('')).toThrow(TypeError);
		});
		Object.values(MIME_TYPE).forEach((mimeType) => {
			test(`should allow mime type ${mimeType}`, () => {
				const onError = jest.fn();
				expect(() => new DOMParser({ onError }).parseFromString('<xml/>', mimeType)).not.toThrow(TypeError);
			});
		});
		test('should use minimal entity map for mime type text/xml', () => {
			const XML = '<xml attr="&quot;">&lt; &amp;</xml>';

			const actual = new DOMParser().parseFromString(XML, MIME_TYPE.XML_TEXT).toString();

			expect(actual).toBe(XML);
		});

		test("should create correct DOM for mimeType 'text/html'", () => {
			const doc = new DOMParser().parseFromString('<HTML lang="en"></HTML>', MIME_TYPE.HTML);
			expect(doc.type).toBe('html');
			expect(doc.contentType).toBe(MIME_TYPE.HTML);
			expect(doc.documentElement.namespaceURI).toBe(NAMESPACE.HTML);
			expect(doc.documentElement.nodeName).toBe('HTML');
		});

		test("should create correct DOM for mimeType 'application/xhtml+xml'", () => {
			const doc = new DOMParser().parseFromString('<HTML lang="en"></HTML>', MIME_TYPE.XML_XHTML_APPLICATION);
			expect(doc.type).toBe('xml');
			expect(doc.contentType).toBe(MIME_TYPE.XML_XHTML_APPLICATION);
			expect(doc.documentElement.namespaceURI).toBe(NAMESPACE.HTML);
			expect(doc.documentElement.nodeName).toBe('HTML');
		});

		test("should create correct DOM for mimeType 'image/svg+xml'", () => {
			const doc = new DOMParser().parseFromString('<svg/>', MIME_TYPE.XML_SVG_IMAGE);
			expect(doc.type).toBe('xml');
			expect(doc.contentType).toBe(MIME_TYPE.XML_SVG_IMAGE);
			expect(doc.documentElement.namespaceURI).toBe(NAMESPACE.SVG);
			expect(doc.documentElement.nodeName).toBe('svg');
		});

		test('should provide access to textContent and attribute values', () => {
			// provides an executable example for https://github.com/xmldom/xmldom/issues/93
			const XML = `
			<pdf2xml producer="poppler" version="0.26.5">
				<page number="1" position="absolute" top="0" left="0" height="1262" width="892">
					<fontspec id="0" size="14" family="Times" color="#000000"/>
					<text tabindex="0" >first</text>
					<text tabindex="1" >second</text>
					<text tabindex="2" >last</text>
				</page>
			</pdf2xml>
`;
			/*
			 TODO: again this is the "simples and most readable way,
			  but it also means testing it over and over
			*/
			const document = new DOMParser().parseFromString(XML, MIME_TYPE.XML_TEXT);
			/*
			 FIXME: from here we are actually testing the Document/Element/Node API
			 maybe this should be split?
			*/
			const textTags = document.getElementsByTagName('text');

			expect(textTags).toHaveLength(3);

			const expectedText = ['first', 'second', 'last'];
			for (let i = 0; i < textTags.length; i++) {
				const textTag = textTags[i];
				expect(textTag.textContent).toBe(expectedText[i]);
				expect(textTag.getAttribute('tabindex')).toBe(`${i}`);
			}
		});
		test('should report fatalError when no documentElement is present', () => {
			const onError = jest.fn();
			expect(() => new DOMParser({ onError }).parseFromString('<!-- only comment -->', MIME_TYPE.XML_TEXT)).toThrow(ParseError);
			expect(onError).toHaveBeenCalledWith('fatalError', expect.stringContaining('root'), expect.any(__DOMHandler));
		});
		test('should report fatalError when doctype is inside element', () => {
			const onError = jest.fn();
			expect(() =>
				new DOMParser({ onError }).parseFromString('<root><!DOCTYPE root PUBLIC "pubId" "systemId"></root>', MIME_TYPE.XML_TEXT)
			).toThrow(ParseError);
			expect(onError).toHaveBeenCalledWith(
				'fatalError',
				expect.stringContaining('Doctype not allowed'),
				expect.any(__DOMHandler)
			);
		});
		test('should be able to parse and serialize XML containing "prototype" namespace prefix', () => {
			const onError = jest.fn();
			const { parser } = getTestParser({ onError });
			const source = `<prototype:test xmlns:prototype="prototype" xmlns:__proto__="__proto__" __proto__:attr="value"/>`;
			const doc = parser.parseFromString(source, MIME_TYPE.XML_TEXT);
			expect(new XMLSerializer().serializeToString(doc)).toEqual(source);
		});
	});
});

describe('DOMHandler', () => {
	describe('startDocument', () => {
		test('should create an XML document when mimeType option is not passed', () => {
			const handler = new __DOMHandler();
			expect(handler.mimeType).toBe(MIME_TYPE.XML_APPLICATION);
			handler.startDocument();
			expect(handler.doc.childNodes).toHaveLength(0);
			expect(handler.doc.type).toBe('xml');
		});

		test.each([
			undefined,
			MIME_TYPE.XML_APPLICATION,
			MIME_TYPE.XML_XHTML_APPLICATION,
			MIME_TYPE.XML_TEXT,
			MIME_TYPE.XML_SVG_IMAGE,
		])('should create an XML document when mimeType option is %s', (mimeType) => {
			const handler = new __DOMHandler({ mimeType });
			expect(handler.mimeType).toBe(mimeType || MIME_TYPE.XML_APPLICATION);
			handler.startDocument();
			expect(handler.doc.childNodes).toHaveLength(0);
			expect(handler.doc.type).toBe('xml');
		});
		test("should create an HTML document when mimeType option is 'text/html'", () => {
			const handler = new __DOMHandler({ mimeType: MIME_TYPE.HTML });
			expect(handler.mimeType).toBe(MIME_TYPE.HTML);
			handler.startDocument();
			expect(handler.doc.childNodes).toHaveLength(0);
			expect(handler.doc.type).toBe('html');
		});
	});
});
