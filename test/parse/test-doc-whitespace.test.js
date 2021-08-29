'use strict'

const { getTestParser } = require('../get-test-parser')

describe('errorHandle', () => {
	it('unclosed tag', () => {
		const { errors, parser } = getTestParser()

		const actual = parser.parseFromString('<foo').toString()

		expect({ actual, ...errors }).toMatchSnapshot()
	})

	it('document source', () => {
		const testSource = '<?xml version="1.0"?>\n<!--test-->\n<xml/>'
		const { errors, parser } = getTestParser()

		const actual = parser.parseFromString(testSource, 'text/xml').toString()

		expect({ actual, ...errors }).toMatchSnapshot()
	})

	it('should encode < literal when not part of a tag', () => {
		const description = '<p>populaciji (< 0.1%), te se</p>'
		const { errors, parser } = getTestParser()

		const actual = parser.parseFromString(description, 'text/html').toString()

		expect({ actual, ...errors }).toMatchSnapshot()
	})
})

describe('whitespace', () => {
	const whitespaceToHex = (str) =>
		str.replace(/\s/g, (c) => `#x${c.charCodeAt(0).toString(16)}`)
	it.each([
		[
			'in text node before first element',
			'\r\n<xml/>',
			(dom) => dom.firstChild.nodeValue,
			'#xa',
		],
		[
			'in attributes',
			'<xml attr="\r\n"/>',
			(dom) => dom.documentElement.getAttribute('attr'),
			'#xa',
		],
		[
			'in firstChild text node',
			'<xml>\x0D\x0A</xml>',
			(dom) => dom.documentElement.firstChild.nodeValue,
			'#xa',
		],
	])('should normalize "\\r\\n" %s', (_, xml, resolveNode, expected) => {
		const { parser } = getTestParser()

		const dom = parser.parseFromString(xml, 'text/html')

		expect(whitespaceToHex(resolveNode(dom))).toBe(expected)
	})
	it.each([
		[
			'before first node',
			'\r \n<xml/>',
			(dom) => dom.firstChild.nodeValue,
			'#xa#x20#xa',
		],
		[
			'in firstChild text node',
			'<xml> \r\r<child/></xml>',
			(dom) => dom.documentElement.firstChild.nodeValue,
			'#x20#xa#xa',
		],
	])(
		'should normalize "\\r" not followed by "\\n" %s',
		(_, xml, resolveNode, expected) => {
			const { parser } = getTestParser()

			const dom = parser.parseFromString(xml, 'text/html')

			expect(whitespaceToHex(resolveNode(dom))).toBe(expected)
		}
	)
})
