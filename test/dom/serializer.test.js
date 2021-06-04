'use strict'

const { DOMParser } = require('../../lib/dom-parser')

describe('XML Serializer', () => {
	it('supports text node containing "]]>"', () => {
		const doc = new DOMParser().parseFromString('<test/>', 'text/xml')
		doc.documentElement.appendChild(doc.createTextNode('hello ]]> there'))
		expect(doc.documentElement.firstChild.toString()).toBe('hello ]]&gt; there')
	})

	it('supports <script> element with no children', () => {
		const doc = new DOMParser({
			xmlns: { xmlns: 'http://www.w3.org/1999/xhtml' },
		}).parseFromString('<html2><script></script></html2>', 'text/html')
		expect(doc.documentElement.firstChild.toString()).toBe(
			'<script xmlns="http://www.w3.org/1999/xhtml"></script>'
		)
	})

	describe('does not serialize namespaces with an empty URI', () => {
		// for more details see the comments in lib/dom.js:needNamespaceDefine
		it('that are used in a node', () => {
			const source = '<w:p><w:r>test1</w:r><w:r>test2</w:r></w:p>'
			const { documentElement } = new DOMParser().parseFromString(source)

			expect(documentElement.firstChild.firstChild).toMatchObject({
				nodeValue: 'test1',
			})
			expect(documentElement.lastChild.firstChild).toMatchObject({
				nodeValue: 'test2',
			})

			expect(documentElement.toString()).toStrictEqual(source)
		})

		it('that are used in an attribute', () => {
			const source = '<w:p w:attr="val"/>'
			const { documentElement } = new DOMParser().parseFromString(source)

			expect(documentElement.toString()).toStrictEqual(source)
		})
	})
})
