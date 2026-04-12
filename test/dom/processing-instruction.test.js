'use strict'

const { DOMParser } = require('../../lib')
const { MIME_TYPE } = require('../../lib/conventions')
const { Node } = require('../../lib/dom')

describe('ProcessingInstruction', () => {
	test('preserves trailing space in PI data when parsed from string', () => {
		const doc = new DOMParser().parseFromString(
			'<?xml-stylesheet href="mycss.css" type="text/css" ?><xml/>',
			MIME_TYPE.XML_TEXT
		)
		const pi = doc.firstChild
		expect(pi.nodeType).toBe(Node.PROCESSING_INSTRUCTION_NODE)
		expect(pi.target).toBe('xml-stylesheet')
		expect(pi.data).toBe('href="mycss.css" type="text/css" ')
	})

	test('preserves trailing newline in PI data when parsed from string', () => {
		const doc = new DOMParser().parseFromString(
			'<?xml-stylesheet href="mycss.css"\n?><xml/>',
			MIME_TYPE.XML_TEXT
		)
		const pi = doc.firstChild
		expect(pi.nodeType).toBe(Node.PROCESSING_INSTRUCTION_NODE)
		expect(pi.target).toBe('xml-stylesheet')
		expect(pi.data).toBe('href="mycss.css"\n')
	})

	test('createProcessingInstruction accepts any target or data without throwing', () => {
		const doc = new DOMParser().parseFromString('<xml/>', MIME_TYPE.XML_TEXT)
		expect(() =>
			doc.createProcessingInstruction('ns:bad', 'data')
		).not.toThrow()
		expect(() => doc.createProcessingInstruction('xml', '?>')).not.toThrow()
		expect(() =>
			doc.createProcessingInstruction('foo', 'inject?>evil')
		).not.toThrow()
	})
})
