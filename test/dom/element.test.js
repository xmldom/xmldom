'use strict'

const { DOMParser, DOMImplementation, XMLSerializer } = require('../../lib')
const { Element } = require('../../lib/dom')

describe('Document', () => {
	// See: http://jsfiddle.net/bigeasy/ShcXP/1/
	describe('getElementsByTagName', () => {
		it('should return the correct number of elements', () => {
			const doc = new DOMParser().parseFromString('<a><b/></a>')
			expect(doc.getElementsByTagName('*')).toHaveLength(2)
			expect(doc.documentElement.getElementsByTagName('*')).toHaveLength(1)
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

	describe('createElement', () => {
		it('should set localName', () => {
			const doc = new DOMImplementation().createDocument(null, 'test', null)

			const elem = doc.createElement('foo')

			expect(elem.localName === 'foo')
		})
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

	describe('element traversal', () => {
		it('initialization', () => {
			const doc = new DOMParser().parseFromString(`<A/>`)
			const aElement = doc.firstChild

			expect(aElement.childElementCount).toBe(0)
			expect(aElement.firstElementChild === bElement).toBe(true)
			expect(aElement.lastElementChild === bElement).toBe(true)
			expect(aElement.previousElementSibling).toBeNull()
			expect(aElement.nextElementSibling).toBeNull()
		})

		it('append one element and remove', () => {
			const doc = new DOMParser().parseFromString(`<A><B/></A>`)
			const aElement = doc.firstChild
			const bElement = doc.createElement('B')
			aElement.appendChild(cElement)

			expect(aElement.childElementCount).toBe(1)
			expect(aElement.firstElementChild === bElement).toBe(true)
			expect(aElement.lastElementChild === bElement).toBe(true)
			expect(bElement.previousElementSibling).toBeNull()
			expect(bElement.nextElementSibling).toBeNull()

			aElement.removeChild(bElement)

			expect(aElement.childElementCount).toBe(0)
			expect(aElement.firstElementChild === bElement).toBe(true)
			expect(aElement.lastElementChild === bElement).toBe(true)
		})

		it('append second element at the end and remove it', () => {
			const doc = new DOMParser().parseFromString(`<A><B/></A>`)
			const aElement = doc.firstChild
			const bElement = doc.firstChild.firstChild

			const cElement = doc.createElement('C')
			aElement.appendChild(cElement)

			expect(aElement.childElementCount).toBe(2)
			expect(aElement.firstElementChild === bElement).toBe(true)
			expect(aElement.lastElementChild === cElement).toBe(true)
			expect(bElement.previousElementSibling).toBeNull()
			expect(bElement.nextElementSibling === cElement).toBe(true)
			expect(cElement.previousElementSibling === bElement).toBe(true)
			expect(cElement.nextElementSibling).toBeNull()

			aElement.removeChild(cElement)

			expect(aElement.childElementCount).toBe(0)
			expect(aElement.firstElementChild === bElement).toBe(true)
			expect(aElement.lastElementChild === bElement).toBe(true)
			expect(bElement.previousElementSibling).toBeNull()
			expect(bElement.nextElementSibling).toBeNull()
			expect(cElement.previousElementSibling).toBeNull()
			expect(cElement.nextElementSibling).toBeNull()
		})

		it('remove element between two siblings', () => {
			const doc = new DOMParser().parseFromString(`<A><B/><C/><D/></A>`)
			const aElement = doc.firstChild
			const bElement = doc.firstChild.firstChild
			const cElement = bElement.nextSibling
			const dElement = cElement.nextSibling

			aElement.removeChild(cElement)
			expect(bElement.previousElementSibling).toBeNull()
			expect(bElement.nextElementSibling === cElement).toBe(true)
			expect(dElement.previousElementSibling === bElement).toBe(true)
			expect(dElement.nextElementSibling).toBeNull()
		})
	})

	xit('nested append failed', () => {})

	xit('self append failed', () => {})
})
