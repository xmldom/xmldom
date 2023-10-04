'use strict';

const { describe, expect, test } = require('@jest/globals');
const { getTestParser } = require('../get-test-parser');
const { MIME_TYPE } = require('../../lib/conventions');

describe('html without reported errors', () => {
	test('unclosed document', () => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString('<img>', MIME_TYPE.HTML).toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});

	test('html attribute (missing quote)', () => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString(`<img attr=1/>`, 'text/html').toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});

	test.each([MIME_TYPE.HTML, MIME_TYPE.XML_TEXT])('%s attribute (missing =)', (mimeType) => {
		const { errors, parser } = getTestParser();
		const xml = `<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0"
       profile="ecmascript" id="scxmlRoot" initial="start">

  <!--
      some comment (next line is empty)

  -->

  <state id="start" name="start">
    <transition event"init" name="init" target="main_state" />
  </state>

  </scxml>
`;
		const actual = parser.parseFromString(xml, mimeType).toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});
});
