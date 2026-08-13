'use strict';

const { describe, expect, test } = require('@jest/globals');

const { MIME_TYPE } = require('../../lib/conventions');
const { DOMParser } = require('../../lib/dom-parser');
const { getTestParser } = require('../get-test-parser');

describe('DOMLocator', () => {
	test('empty line number', () => {
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
			'    <transition event="init" name="init" target="main_state" />',
			'  </state>',
			'',
			'  </scxml>',
		].join('\n');

		const doc = new DOMParser().parseFromString(xml, MIME_TYPE.XML_TEXT);

		expect(doc.getElementsByTagName('transition')[0]).toMatchObject({
			// we are not testing for columnNumber here to keep this test as specific as possible
			// it proves that empty lines are counted as lines
			// it should only fail if that changes
			lineNumber: 10,
		});
	});

	test('node positions', () => {
		const instruction = '<?xml version="1.0"?>';

		const dom = new DOMParser().parseFromString(
			`${instruction}<!-- aaa -->
<test>
  <a attr="value"><![CDATA[1]]>something
</a>x</test>`,
			MIME_TYPE.XML_TEXT
		);

		expect(dom).toMatchObject({
			firstChild: {
				// <?xml version="1.0"?>
				lineNumber: 1,
				columnNumber: 1,
				nextSibling: {
					nodeName: '#comment',
					lineNumber: 1,
					columnNumber: 1 + instruction.length,
				},
			},
			documentElement: {
				nodeName: 'test',
				lineNumber: 2,
				columnNumber: 1,
				firstChild: {
					nodeName: '#text',
					lineNumber: 2,
					columnNumber: 7,
					nextSibling: {
						nodeName: 'a',
						lineNumber: 3,
						columnNumber: 3,
						firstChild: {
							nodeName: '#cdata-section',
							lineNumber: 3,
							columnNumber: 19,
						},
						lastChild: {
							textContent: 'something\n',
							lineNumber: 3,
							columnNumber: 32,
						},
					},
				},
				lastChild: {
					textContent: 'x',
					lineNumber: 4,
					columnNumber: 5,
				},
			},
		});
	});

	test('attribute position', () => {
		const xml = '<html><body title="1&lt;2"><table>&lt;;test</table></body></html>';
		const { errors, parser } = getTestParser({
			locator: { systemId: 'c:/test/1.xml' },
		});

		const doc = parser.parseFromString(xml, 'text/html');

		expect({ actual: doc.toString(), ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();

		const attr = doc.documentElement.firstChild.attributes.item(0);

		expect(attr).toMatchObject({
			lineNumber: 1,
			columnNumber: 19, // position of the starting quote
		});
	});

	test('logs error positions', () => {
		const { errors, parser } = getTestParser();

		parser.parseFromString('<root>\n\t<err</root>', 'text/html');

		expect(errors).toMatchSnapshot();
	});
});
