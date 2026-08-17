'use strict'

const { DOMParser, XMLSerializer, DOMImplementation } = require('../../lib')

// Characterization of the parse/DOM attribute de-duplication behaviour that the
// O(M^2)->O(M) index refactor must preserve byte-for-byte (GHSA parse-dedup).
// release-0.8.x has no NamedNodeMap unit coverage, so this suite is written from
// scratch: it asserts current behaviour and stays green across the refactor.
describe('NamedNodeMap de-duplication behaviour (characterization)', () => {
	const doc = new DOMImplementation().createDocument(null, 'root')
	const serialize = (el) => new XMLSerializer().serializeToString(el)

	it('getNamedItem returns undefined when no attribute matches', () => {
		const el = doc.createElement('e')
		el.setAttribute('x', '1')
		expect(el.attributes.getNamedItem('nope')).toBeUndefined()
	})

	it('getNamedItem returns the attribute matching by nodeName', () => {
		const el = doc.createElement('e')
		el.setAttribute('x', '1')
		expect(el.attributes.getNamedItem('x')).toBe(el.attributes.item(0))
	})

	it('a duplicate nodeName keeps the first position and takes the last value', () => {
		const el = doc.createElement('e')
		const x1 = doc.createAttribute('x')
		x1.value = '1'
		el.setAttributeNode(x1)
		const y = doc.createAttribute('y')
		y.value = '9'
		el.setAttributeNode(y)
		const x2 = doc.createAttribute('x')
		x2.value = '2'
		const returned = el.setAttributeNode(x2)

		expect(returned).toBe(x1) // the replaced attribute is returned
		expect(el.attributes.length).toBe(2)
		// last value wins, first occurrence's position kept (x before y)
		expect(serialize(el)).toStrictEqual('<e x="2" y="9"/>')
	})

	it('setting the same attribute instance twice does not duplicate it', () => {
		const el = doc.createElement('e')
		const x = doc.createAttribute('x')
		x.value = '1'
		el.setAttributeNode(x)
		el.setAttributeNode(x)
		expect(el.attributes.length).toBe(1)
	})

	it('duplicate qualified names in different namespaces are kept distinct', () => {
		const el = doc.createElement('e2')
		const p = doc.createAttributeNS('P', 'p:x')
		p.value = '1'
		el.setAttributeNode(p)
		const q = doc.createAttributeNS('Q', 'q:x')
		q.value = '2'
		el.setAttributeNode(q)

		expect(el.attributes.length).toBe(2)
		expect(serialize(el)).toStrictEqual(
			'<e2 xmlns:p="P" p:x="1" xmlns:q="Q" q:x="2"/>'
		)
	})

	it('many distinct attributes parse and serialize in source order', () => {
		const names = Array.from({ length: 50 }, (_, i) => 'a' + i)
		const source = '<r ' + names.map((n) => n + '="x"').join(' ') + '/>'
		const el = new DOMParser().parseFromString(
			source,
			'text/xml'
		).documentElement

		expect(el.attributes.length).toBe(names.length)
		expect(serialize(el)).toStrictEqual(source)
	})
})
