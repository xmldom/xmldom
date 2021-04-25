'use strict'

const {
	DOMParser,
	DOMImplementation,
	XMLSerializer,
} = require('../../lib/dom-parser')

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

	it('creates elements with a localName', () => {
		const doc = new DOMImplementation().createDocument(null, 'test', null)
		const elem = doc.createElement('foo')
		expect(elem.localName === 'foo')
	})

	xit('nested append failed', () => {})

	xit('self append failed', () => {})
})
