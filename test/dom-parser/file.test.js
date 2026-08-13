'use strict';

const fs = require('fs');
const { describe, expect, test } = require('@jest/globals');

const { MIME_TYPE } = require('../../lib/conventions');
const { DOMParser } = require('../../lib/dom-parser');
const { ParseError } = require('../../lib/errors');

describe('from file', () => {
	test('file-test1.xml', () => {
		const data = fs
			.readFileSync(__dirname + '/file-test1.xml')
			.toString()
			.replace(/\r\n?/g, '\n');
		const expexted = fs
			.readFileSync(__dirname + '/file-test1.result.xml')
			.toString()
			.replace(/\r\n?/g, '\n');
		// fs.writeFileSync(__dirname+'/file-test1.result.xml',result);

		const actual = new DOMParser().parseFromString(data, MIME_TYPE.XML_TEXT).toString();

		expect(actual).toStrictEqual(expexted);
	});
	test('file-bom.xml', () => {
		const buffer = fs.readFileSync(__dirname + '/file-bom.xml');
		expect(buffer.toString().indexOf('<')).toBeGreaterThan(0);

		const source = fs.readFileSync(__dirname + '/file-bom.xml', 'utf-8');
		expect(source.indexOf('<')).toBeGreaterThan(0);
		expect(() => new DOMParser().parseFromString(source, MIME_TYPE.XML_TEXT)).toThrow(ParseError);

		const data = new TextDecoder().decode(buffer);

		expect(data.indexOf('<')).toBe(0);

		new DOMParser().parseFromString(data, MIME_TYPE.XML_TEXT);
	});
});
