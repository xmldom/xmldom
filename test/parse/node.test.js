'use strict'

const { Node } = require('../../lib/dom')
const { DOMParser } = require('../../lib/dom-parser')

const expectNeighbours = (first, second, ...nodes) => {
	expect(first.nextSibling).toStrictEqual(second)
	expect(second.previousSibling).toStrictEqual(first)
	expect(first.parentNode).toStrictEqual(second.parentNode)

	if (nodes.length > 0) {
		expectNeighbours(second, ...nodes)
	}
}

describe('XML Node Parse', () => {
	it('element', () => {
		const dom = new DOMParser().parseFromString('<xml><child/></xml>')

		expect(dom.documentElement.nodeType).toStrictEqual(Node.ELEMENT_NODE)
		expect(dom.documentElement.firstChild.nodeType).toStrictEqual(
			Node.ELEMENT_NODE
		)
		expect(dom).toMatchObject({
			childNodes: {
				length: 1,
			},
			documentElement: {
				childNodes: {
					length: 1,
				},
				firstChild: {
					nodeName: 'child',
					tagName: 'child',
				},
				nodeName: 'xml',
				tagName: 'xml',
			},
		})
	})

	it('text', () => {
		const { firstChild } = new DOMParser().parseFromString(
			'<xml>start center end</xml>'
		).documentElement

		expect(firstChild.nodeType).toStrictEqual(Node.TEXT_NODE)
		expect(firstChild).toMatchObject({
			data: 'start center end',
			nextSibling: null,
		})
	})

	it('cdata', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml>start <![CDATA[<encoded>]]> end<![CDATA[[[[[[[[[]]]]]]]]]]></xml>'
		)
		expect(documentElement.firstChild).toMatchObject({
			data: 'start ',
			nextSibling: {
				data: '<encoded>',
				nextSibling: {
					nextSibling: {
						data: '[[[[[[[[]]]]]]]]',
					},
				},
			},
		})
	})

	it('cdata empty', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml><![CDATA[]]>start <![CDATA[]]> end</xml>'
		)
		expect(documentElement).toMatchObject({
			textContent: 'start  end',
		})
	})

	it('comment', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml><!-- comment&>< --></xml>'
		)

		expect(documentElement.firstChild).toMatchObject({
			nodeValue: ' comment&>< ',
		})
	})

	it('cdata comment', () => {
		const { documentElement } = new DOMParser().parseFromString(
			'<xml>start <![CDATA[<encoded>]]> <!-- comment -->end</xml>'
		)

		expect(documentElement.firstChild).toMatchObject({
			nodeName: '#text', // 0
			nodeValue: 'start ',
			nextSibling: {
				nodeName: '#cdata-section', // 1
				nodeValue: '<encoded>',
				nextSibling: {
					nodeName: '#text', // 2
					nodeValue: ' ',
					nextSibling: {
						nodeName: '#comment', // 3
						nodeValue: ' comment ',
						nextSibling: {
							nodeName: '#text', // 4
							nodeValue: 'end',
						},
					},
				},
			},
		})
	})

	describe('appendChild', () => {
		it('returns the argument', () => {
			const dom = new DOMParser().parseFromString('<xml/>')

			const child = dom.createElement('child')

			expect(dom.documentElement.appendChild(child)).toStrictEqual(child)
		})

		it('appends as firstChild', () => {
			const dom = new DOMParser().parseFromString('<xml/>')
			const child = dom.createElement('child')

			dom.documentElement.appendChild(child)

			expect(dom.documentElement.firstChild).toStrictEqual(child)
		})
		it('subsequent calls append in order', () => {
			const dom = new DOMParser().parseFromString('<xml />')
			const fragment = dom.createDocumentFragment()

			expect(fragment.nodeType).toStrictEqual(Node.DOCUMENT_FRAGMENT_NODE)

			const first = fragment.appendChild(dom.createElement('first'))
			const last = fragment.appendChild(dom.createElement('last'))

			expectNeighbours(first, last)
			expect(fragment.firstChild).toStrictEqual(first)
			expect(fragment.lastChild).toStrictEqual(last)
		})
	})

	describe('insertBefore', () => {
		it('places created element before existing element', () => {
			const dom = new DOMParser().parseFromString('<xml><child/></xml>')
			const inserted = dom.createElement('sibling')
			const child = dom.documentElement.firstChild

			child.parentNode.insertBefore(inserted, child)

			expectNeighbours(inserted, child)
		})
		it('inserts all elements in DocumentFragment', () => {
			const dom = new DOMParser().parseFromString('<xml><child/></xml>')
			const child = dom.documentElement.firstChild

			const fragment = dom.createDocumentFragment()
			const first = fragment.appendChild(dom.createElement('first'))
			const second = fragment.appendChild(dom.createElement('second'))

			child.parentNode.insertBefore(fragment, child)

			expectNeighbours(first, second, child)
			expect(child.parentNode.firstChild).toStrictEqual(first)
		})
	})

	it('preserves instruction', () => {
		const source =
			'<?xml version="1.0"?><root><child>&amp;<!-- &amp; --></child></root>'

		const actual = new DOMParser()
			.parseFromString(source, 'text/xml')
			.toString()

		expect(actual).toStrictEqual(source)
	})

	it('preserves doctype with public id and sysid', () => {
		const DOCTYPE =
			'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"' +
			' "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'

		const actual = new DOMParser()
			.parseFromString(`${DOCTYPE}<html/>`, 'text/html')
			.toString()

		expect(actual).toStrictEqual(
			`${DOCTYPE}<html xmlns="http://www.w3.org/1999/xhtml"></html>`
		)
	})
})
