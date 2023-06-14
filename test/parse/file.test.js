'use strict';

const fs = require('fs');
const { describe, expect, test } = require('@jest/globals');

const { MIME_TYPE } = require('../../lib/conventions');
const { DOMParser } = require('../../lib/dom-parser');

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
		// fs.writeFileSync(__dirname+'/file-test1.result.xml',result)

		const actual = new DOMParser().parseFromString(data, MIME_TYPE.XML_TEXT).toString();

		expect(actual).toStrictEqual(expexted);
	});
});
