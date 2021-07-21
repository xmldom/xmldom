'use strict'

const { DOMParser } = require('../../lib/dom-parser')
const { XMLSerializer } = require('../../lib/dom')
const { MIME_TYPE } = require('../../lib/conventions')

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

	describe('does detect matching visible namespace for tags without prefix', () => {
		it('should add local namespace after sibling', () => {
			const str = '<a:foo xmlns:a="AAA"><bar xmlns="AAA"/></a:foo>'
			const doc = new DOMParser().parseFromString(str, MIME_TYPE.XML_TEXT)

			const child = doc.createElementNS('AAA', 'child')
			expect(new XMLSerializer().serializeToString(child)).toBe(
				'<child xmlns="AAA"/>'
			)
			doc.documentElement.appendChild(child)
			expect(new XMLSerializer().serializeToString(doc)).toBe(
				'<a:foo xmlns:a="AAA"><bar xmlns="AAA"/><a:child/></a:foo>'
			)
		})
		it('should add local namespace from parent', () => {
			const str = '<a:foo xmlns:a="AAA"/>'
			const doc = new DOMParser().parseFromString(str, MIME_TYPE.XML_TEXT)

			const child = doc.createElementNS('AAA', 'child')
			expect(new XMLSerializer().serializeToString(child)).toBe(
				'<child xmlns="AAA"/>'
			)
			doc.documentElement.appendChild(child)
			expect(new XMLSerializer().serializeToString(doc)).toBe(
				'<a:foo xmlns:a="AAA"><a:child/></a:foo>'
			)
			const nested = doc.createElementNS('AAA', 'nested')
			expect(new XMLSerializer().serializeToString(nested)).toBe(
				'<nested xmlns="AAA"/>'
			)
			child.appendChild(nested)
			expect(new XMLSerializer().serializeToString(doc)).toBe(
				'<a:foo xmlns:a="AAA"><a:child><a:nested/></a:child></a:foo>'
			)
		})
		it('should add local namespace as xmlns in HTML', () => {
			const str = '<a:foo xmlns:a="AAA"/>'
			const doc = new DOMParser().parseFromString(str, MIME_TYPE.HTML)

			const child = doc.createElementNS('AAA', 'child')
			expect(new XMLSerializer().serializeToString(child, true)).toBe(
				'<child xmlns="AAA"></child>'
			)
			doc.documentElement.appendChild(child)
			expect(new XMLSerializer().serializeToString(doc, true)).toBe(
					'<a:foo xmlns:a="AAA"><child xmlns="AAA"></child></a:foo>'
			)
			const nested = doc.createElementNS('AAA', 'nested')
			expect(new XMLSerializer().serializeToString(nested, true)).toBe(
				'<nested xmlns="AAA"></nested>'
			)
			child.appendChild(nested)
			expect(new XMLSerializer().serializeToString(doc, true)).toBe(
				'<a:foo xmlns:a="AAA"><child xmlns="AAA"><nested></nested></child></a:foo>'
			)
		})
		it('should add keep different default namespace of child', () => {
			const str = '<a:foo xmlns:a="AAA"/>'
			const doc = new DOMParser().parseFromString(str, MIME_TYPE.XML_TEXT)

			const child = doc.createElementNS('BBB', 'child')
			child.setAttribute('xmlns', 'BBB')
			expect(new XMLSerializer().serializeToString(child)).toBe(
				'<child xmlns="BBB"/>'
			)
			doc.documentElement.appendChild(child)
			const nested = doc.createElementNS('BBB', 'nested')
			expect(new XMLSerializer().serializeToString(nested)).toBe(
				'<nested xmlns="BBB"/>'
			)
			child.appendChild(nested)
			expect(new XMLSerializer().serializeToString(doc)).toBe(
				'<a:foo xmlns:a="AAA"><child xmlns="BBB"><nested/></child></a:foo>'
			)
		})
	})
})
