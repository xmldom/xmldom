'use strict'

const { DOMParser, XMLSerializer } = require('../../lib/dom-parser')

// Create a Test Suite
describe('XML Namespace Parse', () => {
	// See: http://jsfiddle.net/bigeasy/ShcXP/1/
	it('supports Document_getElementsByTagName', () => {
		const doc = new DOMParser().parseFromString('<a><b/></a>')
		expect(doc.getElementsByTagName('*')).toHaveLength(2)
		expect(doc.documentElement.getElementsByTagName('*')).toHaveLength(1)
	})

	it('supports getElementsByTagName', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" xmlns:t="http://test.com" xmlns:t2="http://test2.com">' +
				'<t:test/><test/><t2:test/>' +
				'<child attr="1"><test><child attr="2"/></test></child>' +
				'<child attr="3"/></xml>',
			'text/xml'
		)
		let childs = doc.documentElement.getElementsByTagName('child')
		expect(childs.item(0).getAttribute('attr')).toBe('1')
		expect(childs.item(1).getAttribute('attr')).toBe('2')
		expect(childs.item(2).getAttribute('attr')).toBe('3')
		expect(childs).toHaveLength(3)

		childs = doc.getElementsByTagName('child')
		expect(childs.item(0).getAttribute('attr')).toBe('1')
		expect(childs.item(1).getAttribute('attr')).toBe('2')
		expect(childs.item(2).getAttribute('attr')).toBe('3')
		expect(childs).toHaveLength(3)

		childs = doc.documentElement.getElementsByTagName('*')
		for (let i = 0, buf = []; i < childs.length; i++) {
			buf.push(childs[i].tagName)
		}
		expect(childs).toHaveLength(7)

		const feed = new DOMParser().parseFromString(
			'<feed><entry>foo</entry></feed>'
		)
		const entries = feed.documentElement.getElementsByTagName('entry')
		expect(entries).toHaveLength(1)
		expect(entries[0].nodeName).toBe('entry')
		expect(feed.documentElement.childNodes.item(0).nodeName).toBe('entry')
	})

	it('supports getElementsByTagNameNS', () => {
		const doc = new DOMParser().parseFromString(
			'<xml xmlns="http://test.com" xmlns:t="http://test.com" xmlns:t2="http://test2.com">' +
				'<t:test/><test/><t2:test/>' +
				'<child attr="1"><test><child attr="2"/></test></child>' +
				'<child attr="3"/></xml>',
			'text/xml'
		)

		let childs = doc.documentElement.getElementsByTagNameNS(
			'http://test.com',
			'*'
		)
		expect(childs).toHaveLength(6)

		childs = doc.getElementsByTagNameNS('http://test.com', '*')
		expect(childs).toHaveLength(7)

		childs = doc.documentElement.getElementsByTagNameNS(
			'http://test.com',
			'test'
		)
		expect(childs).toHaveLength(3)

		childs = doc.getElementsByTagNameNS('http://test.com', 'test')
		expect(childs).toHaveLength(3)

		childs = doc.getElementsByTagNameNS('*', 'test')
		expect(childs).toHaveLength(4)

		childs = doc.documentElement.getElementsByTagNameNS('*', 'test')
		expect(childs).toHaveLength(4)
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

	xit('nested append failed', () => {})

	xit('self append failed', () => {})
})
