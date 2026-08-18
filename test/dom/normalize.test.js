'use strict'

const { DOMImplementation } = require('../../lib')

/**
 * `Node#normalize()` merges each run of adjacent `Text` siblings into the first
 * node of the run, which survives and carries the concatenated data (node
 * identity / locator semantics). The O(K) rewrite (GHSA-93r5-fhx6-vmg9) must keep
 * that invariant.
 */
describe('Node#normalize adjacent-text merge', () => {
	const doc = () => new DOMImplementation().createDocument(null, 'root')

	it('merges a run of adjacent text nodes into the first, which survives with the concatenated data', () => {
		const d = doc()
		const root = d.documentElement
		const first = d.createTextNode('a')
		root.appendChild(first)
		root.appendChild(d.createTextNode('b'))
		root.appendChild(d.createTextNode('c'))

		root.normalize()

		expect(root.childNodes.length).toBe(1)
		expect(root.firstChild).toBe(first) // the first node survives (identity)
		expect(first.data).toBe('abc')
		expect(first.nodeValue).toBe('abc')
		expect(first.length).toBe(3)
		expect(root.lastChild).toBe(first)
		expect(first.nextSibling).toBeNull()
	})

	it('merges only within a run, leaving non-text nodes and their boundaries intact', () => {
		const d = doc()
		const root = d.documentElement
		const t1 = d.createTextNode('a')
		root.appendChild(t1)
		root.appendChild(d.createTextNode('b'))
		const el = d.createElement('e')
		root.appendChild(el)
		const t2 = d.createTextNode('c')
		root.appendChild(t2)
		root.appendChild(d.createTextNode('d'))

		root.normalize()

		expect(root.childNodes.length).toBe(3)
		expect(root.firstChild).toBe(t1)
		expect(t1.data).toBe('ab')
		expect(root.childNodes.item(1)).toBe(el)
		expect(root.lastChild).toBe(t2)
		expect(t2.data).toBe('cd')
		expect(t1.nextSibling).toBe(el)
		expect(el.previousSibling).toBe(t1)
		expect(el.nextSibling).toBe(t2)
		expect(t2.previousSibling).toBe(el)
	})
})
