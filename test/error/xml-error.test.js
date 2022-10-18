'use strict';

const { getTestParser } = require('../get-test-parser');

describe('html vs xml:', () => {
	it.each(['text/html', 'text/xml'])('unclosed document in %s', (mimeType) => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString('<img>', mimeType).toString();

		expect({ actual, ...errors }).toMatchSnapshot();
	});

	it.each([
		['<test><!--', '<test/>'],
		['<r', '<r/>'],
	])('invalid xml node "%s"', (input, expected) => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString(input, 'text/xml').documentElement.toString();

		expect({ actual, ...errors }).toMatchSnapshot({ actual: expected });
	});

	it('html attribute (miss quote)', () => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString('<img attr=1/>', 'text/html').toString();

		expect({ actual, ...errors }).toMatchSnapshot();
	});

	it.each(['text/html', 'text/xml'])('%s attribute (missing =)', (mimeType) => {
		const { errors, parser } = getTestParser();
		const xml = [
			'<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0"',
			'       profile="ecmascript" id="scxmlRoot" initial="start">',
			'',
			'  <!--',
			'      some comment (next line is empty)',
			'',
			'  -->',
			'',
			'  <state id="start" name="start">',
			// this line contains the missing = for attribute value
			'    <transition event"init" name="init" target="main_state" />',
			'  </state>',
			'',
			'  </scxml>',
		].join('\n');

		const actual = parser.parseFromString(xml, mimeType).toString();

		expect({ actual, ...errors }).toMatchSnapshot();
	});
});
