'use strict'

const { DOMParser } = require('../../lib/dom-parser')
const { getTestParser } = require('../get-test-parser')

describe('DOMLocator', () => {
	it('empty line number', () => {
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
		].join('\n')
		const doc = new DOMParser().parseFromString(xml, 'text/xml')
		expect(doc.getElementsByTagName('transition')[0]).toMatchObject({
			lineNumber: 10,
		})
	})

	it('node positions', () => {
		const instruction = '<?xml version="1.0"?>'
		const dom = new DOMParser().parseFromString(
			`${instruction}<!-- aaa -->\n` +
				'<test>\n' +
				'  <a attr="value"><![CDATA[1]]>something\n' +
				'</a>x</test>',
			'text/xml'
		)
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
		})
	})

	it('attribute position', () => {
		// TODO: xml not well formed but no warning or error, extract into different test?
		const xml = '<html><body title="1<2"><table>&lt;;test</body></body></html>'
		const { errors, parser } = getTestParser({
			locator: { systemId: 'c:/test/1.xml' },
		})

		const doc = parser.parseFromString(xml, 'text/html')
		expect({ actual: doc.toString(), ...errors }).toMatchSnapshot()

		const attr = doc.documentElement.firstChild.attributes.item(0)
		expect(attr).toMatchObject({
			lineNumber: 1,
			columnNumber: 19, // position of the starting quote
		})
	})

	it('logs error positions', () => {
		const { errors, parser } = getTestParser()

		parser.parseFromString('<root>\n\t<err</root>', 'text/html')

		expect(errors).toMatchSnapshot()
	})
})
