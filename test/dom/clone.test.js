'use strict'

const {DOMParser, XMLSerializer} = require('../../lib/dom-parser');

describe('XML Namespace Parse', () => {
	it('can properly set clone', () => {
		const doc1 = new DOMParser().parseFromString(
			"<doc1 attr1='1' attr2='a2'>text1<child>text2</child></doc1>",
			'text/xml'
		)
		const doc1s = new XMLSerializer().serializeToString(doc1)
		const n = doc1.cloneNode(true)
		expect(n.toString()).toEqual(doc1s.toString())
	})

	it('can properly import', () => {
		const doc1 = new DOMParser().parseFromString("<doc2 attr='2'/>")
		const doc2 = new DOMParser().parseFromString(
			"<doc1 attr1='1' attr2='a2'>text1<child>text2</child></doc1>",
			'text/xml'
		)

		const doc3 = new DOMParser().parseFromString(
			"<doc2 attr='2'><doc1 attr1='1' attr2='a2'>text1<child>text2</child></doc1></doc2>"
		)
		const n = doc1.importNode(doc2.documentElement, true)
		doc1.documentElement.appendChild(n)
		expect(doc1.toString()).toEqual(doc3.toString())
		expect(doc2.toString()).not.toEqual(doc3.toString())
	})
})
