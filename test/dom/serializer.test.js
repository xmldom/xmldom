'use strict'

const { DOMParser } = require('../../lib/dom-parser')

describe('XML Serializer', () => {
	it('supports text node containing "]]>"', () => {
		const doc = new DOMParser().parseFromString('<test/>', 'text/xml')
		doc.documentElement.appendChild(doc.createTextNode('hello ]]> there'))
		expect(doc.documentElement.firstChild.toString()).toEqual('hello ]]> there')
	})

	it('supports <script> element with no children', () => {
		const doc = new DOMParser({
			xmlns: { xmlns: 'http://www.w3.org/1999/xhtml' },
		}).parseFromString('<html2><script></script></html2>', 'text/html')
		expect(doc.documentElement.firstChild.toString()).toEqual(
			'<script xmlns="http://www.w3.org/1999/xhtml"></script>'
		)
	})
})
