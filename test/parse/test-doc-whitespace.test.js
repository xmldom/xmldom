'use strict';

const { describe, expect, test } = require('@jest/globals');
const { MIME_TYPE } = require('../../lib/conventions');
const { getTestParser } = require('../get-test-parser');

describe('errorHandle', () => {
	test('unclosed tag', () => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString('<foo', MIME_TYPE.XML_TEXT).toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});

	test('document source', () => {
		const testSource = '<?xml version="1.0"?>\n<!--test-->\n<xml/>';
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString(testSource, MIME_TYPE.XML_TEXT).toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});

	test('should encode < literal when not part of a tag', () => {
		const description = '<p>populaciji (< 0.1%), te se</p>';
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString(description, 'text/html').toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});
});
