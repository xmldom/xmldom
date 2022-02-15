'use strict'

const { DOMParser, DOMImplementation, XMLSerializer } = require('../../lib')
const { MIME_TYPE, NAMESPACE } = require('../../lib/conventions')
const { Element } = require('../../lib/dom')

describe('Document', () => {
	// See: http://jsfiddle.net/bigeasy/ShcXP/1/
	describe('getElementsByTagName', () => {
		it('should return the correct number of elements in XML documents', () => {
			const doc = new DOMParser().parseFromString(
				`<xml id="0" lang="en">
						<head id="1"><title id="2">Title</title></head>
						<body id="3">
							<div id="4"><p id="5"></p></div>
							<html xmlns="${NAMESPACE.HTML}" id="6"><div id="7"></div></html>
						</body>
					</xml>`
			)
			expect(doc.getElementsByTagName('*')).toHaveLength(8)
			expect(doc.documentElement.getElementsByTagName('*')).toHaveLength(7)
			expect(doc.getElementsByTagName('div')).toHaveLength(2)
			expect(doc.documentElement.getElementsByTagName('div')).toHaveLength(2)

			// in HTML documents inside the HTML namespace case doesn't have to match,
			// this is not an HTML document, so no div will be found,
			// not even the second one inside the HTML namespace
			expect(doc.getElementsByTagName('DIV')).toHaveLength(0)
			expect(doc.documentElement.getElementsByTagName('DIV')).toHaveLength(0)
		})

		it('should return the correct number of elements in HTML documents', () => {
			const doc = new DOMParser().parseFromString(
				`<html id="0" lang="en">
						<head id="1"><title id="2">Title</title></head>
						<body id="3">
							<div id="4"><p id="5"></p></div>
							<xml xmlns="${NAMESPACE.XML}" id="6"><div id="7"></div></xml>
						</body>
					</html>`,
				MIME_TYPE.HTML
			)
			expect(doc.getElementsByTagName('*')).toHaveLength(8)
			expect(doc.documentElement.getElementsByTagName('*')).toHaveLength(7)
			expect(doc.getElementsByTagName('div')).toHaveLength(2)
			expect(doc.documentElement.getElementsByTagName('div')).toHaveLength(2)

			// in HTML documents inside the HTML namespace case doesn't have to match,
			// but the second one is not in the HTML namespace
			const documentDIVs = doc.getElementsByTagName('DIV')
			expect(documentDIVs).toHaveLength(1)
			expect(documentDIVs.item(0).getAttribute('id')).toBe('4')
			const elementDIVs = doc.documentElement.getElementsByTagName('DIV')
			expect(elementDIVs).toHaveLength(1)
			expect(elementDIVs.item(0).getAttribute('id')).toBe('4')
		})

		it('should support API on element (this test needs to be split)', () => {
			const doc = new DOMParser().parseFromString(
				'<xml xmlns="http://test.com" xmlns:t="http://test.com" xmlns:t2="http://test2.com">' +
					'<t:test/><test/><t2:test/>' +
					'<child attr="1"><test><child attr="2"/></test></child>' +
					'<child attr="3"/></xml>',
				'text/xml'
			)

			const childs1 = doc.documentElement.getElementsByTagName('child')
			expect(childs1.item(0).getAttribute('attr')).toBe('1')
			expect(childs1.item(1).getAttribute('attr')).toBe('2')
			expect(childs1.item(2).getAttribute('attr')).toBe('3')
			expect(childs1).toHaveLength(3)

			const childs2 = doc.getElementsByTagName('child')
			expect(childs2.item(0).getAttribute('attr')).toBe('1')
			expect(childs2.item(1).getAttribute('attr')).toBe('2')
			expect(childs2.item(2).getAttribute('attr')).toBe('3')
			expect(childs2).toHaveLength(3)

			const childs3 = doc.documentElement.getElementsByTagName('*')
			for (let i = 0, buf = []; i < childs3.length; i++) {
				buf.push(childs3[i].tagName)
			}
			expect(childs3).toHaveLength(7)

			const feed = new DOMParser().parseFromString(
				'<feed><entry>foo</entry></feed>'
			)
			const entries = feed.documentElement.getElementsByTagName('entry')
			expect(entries).toHaveLength(1)
			expect(entries[0].nodeName).toBe('entry')
			expect(feed.documentElement.childNodes.item(0).nodeName).toBe('entry')
		})
	})

	it('supports getElementsByTagNameNS', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" xmlns:t="http://test.com" xmlns:t2="http://test2.com">' +
				'<t:test/><test/><t2:test/>' +
				'<child attr="1"><test><child attr="2"/></test></child>' +
				'<child attr="3"/></xml>',
			'text/xml'
		)

		const childs1 = doc.documentElement.getElementsByTagNameNS(
			'http://test.com',
			'*'
		)
		expect(childs1).toHaveLength(6)

		const childs2 = doc.getElementsByTagNameNS('http://test.com', '*')
		expect(childs2).toHaveLength(7)

		const childs3 = doc.documentElement.getElementsByTagNameNS(
			'http://test.com',
			'test'
		)
		expect(childs3).toHaveLength(3)

		const childs4 = doc.getElementsByTagNameNS('http://test.com', 'test')
		expect(childs4).toHaveLength(3)

		const childs5 = doc.getElementsByTagNameNS('*', 'test')
		expect(childs5).toHaveLength(4)

		const childs6 = doc.documentElement.getElementsByTagNameNS('*', 'test')
		expect(childs6).toHaveLength(4)
	})

	it('supports getElementById', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" id="root">' +
				'<child id="a1" title="1"><child id="a2"  title="2"/></child>' +
				'<child id="a1"   title="3"/></xml>',
			'text/xml'
		)
		expect(doc.getElementById('root')).not.toBeNull()
		expect(doc.getElementById('a1').getAttribute('title')).toBe('1')
		expect(doc.getElementById('a2').getAttribute('title')).toBe('2')
		expect(doc.getElementById('a2').getAttribute('title2')).toBe('')
	})

	it('can properly append exist child', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" id="root">' +
				'<child1 id="a1" title="1"><child11 id="a2"  title="2"/></child1>' +
				'<child2 id="a1"   title="3"/><child3 id="a1"   title="3"/></xml>',
			'text/xml'
		)

		const doc1 = doc
		const str1 = new XMLSerializer().serializeToString(doc)
		const doc2 = doc1.cloneNode(true)
		const doc3 = doc1.cloneNode(true)
		const doc4 = doc1.cloneNode(true)

		doc3.documentElement.appendChild(doc3.documentElement.lastChild)
		doc4.documentElement.appendChild(doc4.documentElement.firstChild)

		const str2 = new XMLSerializer().serializeToString(doc2)
		const str3 = new XMLSerializer().serializeToString(doc3)
		const str4 = new XMLSerializer().serializeToString(doc4)
		expect(str1).toBe(str2)
		expect(str2).toBe(str3)
		expect(str3).not.toBe(str4)
		expect(str3.length).toBe(str4.length)
	})

	it('can properly append exist other child', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" id="root">' +
				'<child1 id="a1" title="1"><child11 id="a2"  title="2"><child/></child11></child1>' +
				'<child2 id="a1"   title="3"/><child3 id="a1"   title="3"/></xml>',
			'text/xml'
		)

		const doc1 = doc
		const str1 = new XMLSerializer().serializeToString(doc)
		const doc2 = doc1.cloneNode(true)

		expect(doc2.documentElement.lastChild.childNodes).toHaveLength(0)
		doc2.documentElement.appendChild(doc2.documentElement.firstChild.firstChild)

		const str2 = new XMLSerializer().serializeToString(doc2)

		expect(doc2.documentElement.lastChild.childNodes).toHaveLength(1)
		expect(str1).not.toBe(str2)
		expect(str1).not.toHaveLength(str2.length)
		const doc3 = new DOMParser().parseFromString(str2, 'text/xml')
		doc3.documentElement.firstChild.appendChild(doc3.documentElement.lastChild)
		const str3 = new XMLSerializer().serializeToString(doc3)
		expect(str1).toBe(str3)
	})

	it('can properly set textContent', () => {
		const doc = new DOMParser().parseFromString('<test><a/><b><c/></b></test>')
		const a = doc.documentElement.firstChild
		const b = a.nextSibling
		a.textContent = 'hello'
		expect(doc.documentElement.toString()).toBe(
			'<test><a>hello</a><b><c/></b></test>'
		)
		b.textContent = 'there'
		expect(doc.documentElement.toString()).toBe(
			'<test><a>hello</a><b>there</b></test>'
		)
		b.textContent = ''
		expect(doc.documentElement.toString()).toBe('<test><a>hello</a><b/></test>')
		doc.documentElement.textContent = 'bye'
		expect(doc.documentElement.toString()).toBe('<test>bye</test>')
	})

	it('appendElement and removeElement', () => {
		const dom = new DOMParser().parseFromString(`<root><A/><B/><C/></root>`)
		const doc = dom.documentElement
		const arr = []
		while (doc.firstChild) {
			const node = doc.removeChild(doc.firstChild)
			arr.push(node)
			expect(node.parentNode).toBeNull()
			expect(node.previousSibling).toBeNull()
			expect(node.nextSibling).toBeNull()
			expect(node.ownerDocument).toBe(dom)
			expect(doc.firstChild).not.toBe(node)
			const expectedLength = 3 - arr.length
			expect(doc.childNodes).toHaveLength(expectedLength)
			expect(doc.childNodes.item(expectedLength)).toBeNull()
		}
		expect(arr).toHaveLength(3)
		while (arr.length) {
			const node = arr.shift()
			expect(doc.appendChild(node)).toBe(node)
			expect(node.parentNode).toBe(doc)
			const expectedLength = 3 - arr.length
			expect(doc.childNodes).toHaveLength(expectedLength)
			expect(doc.childNodes.item(expectedLength - 1)).toBe(node)
			if (expectedLength > 1) {
				expect(node.previousSibling).toBeInstanceOf(Element)
				expect(node.previousSibling.nextSibling).toBe(node)
			}
		}
		expect(doc.childNodes.toString()).toBe(`<A/><B/><C/>`)
	})

	xit('nested append failed', () => {})

	xit('self append failed', () => {})
})

describe('Element', () => {
	const ATTR_MIXED_CASE = 'AttR'
	const ATTR_LOWER_CASE = 'attr'
	const VALUE = '2039e2dk'
	describe('setAttribute', () => {
		test.each([null, NAMESPACE.HTML])(
			'should set attribute as is in XML document with namespace %s',
			(ns) => {
				const doc = new DOMImplementation().createDocument(ns, 'xml')

				doc.documentElement.setAttribute(ATTR_MIXED_CASE, VALUE)

				expect(doc.documentElement.attributes).toHaveLength(1)
				expect(doc.documentElement.attributes.item(0)).toMatchObject({
					name: ATTR_MIXED_CASE,
					value: VALUE,
				})
				expect(doc.documentElement.hasAttribute(ATTR_MIXED_CASE)).toBe(true)
				expect(doc.documentElement.hasAttribute(ATTR_LOWER_CASE)).toBe(false)
			}
		)
		test('should set attribute lower cased in HTML document', () => {
			const doc = new DOMImplementation().createHTMLDocument()

			doc.documentElement.setAttribute(ATTR_MIXED_CASE, VALUE)

			expect(doc.documentElement.attributes).toHaveLength(1)
			expect(doc.documentElement.attributes.item(0)).toMatchObject({
				name: ATTR_LOWER_CASE,
				value: VALUE,
			})
			// the attribute is accessible with the lower cased name
			expect(doc.documentElement.hasAttribute(ATTR_LOWER_CASE)).toBe(true)
			// and with the original name (and any other one that is the same lower case name)
			expect(doc.documentElement.hasAttribute(ATTR_MIXED_CASE)).toBe(true)
			// the value is the same for "both" attribute names
			expect(doc.documentElement.getAttribute(ATTR_MIXED_CASE)).toBe(
				doc.documentElement.getAttribute(ATTR_LOWER_CASE)
			)
			// since it's the same node it resolves to
			expect(doc.documentElement.getAttributeNode(ATTR_MIXED_CASE)).toBe(
				doc.documentElement.getAttributeNode(ATTR_LOWER_CASE)
			)
		})
		test('should set attribute as is in HTML document with different namespace', () => {
			const doc = new DOMImplementation().createHTMLDocument()
			const nameSpacedElement = doc.createElementNS(NAMESPACE.SVG, 'svg')
			expect(nameSpacedElement.namespaceURI).toBe(NAMESPACE.SVG)

			nameSpacedElement.setAttribute(ATTR_MIXED_CASE, VALUE)

			expect(nameSpacedElement.attributes).toHaveLength(1)
			expect(nameSpacedElement.attributes.item(0)).toMatchObject({
				name: ATTR_MIXED_CASE,
				value: VALUE,
			})
			expect(nameSpacedElement.hasAttribute(ATTR_MIXED_CASE)).toBe(true)
			expect(doc.documentElement.hasAttribute(ATTR_LOWER_CASE)).toBe(false)
		})
	})
})
