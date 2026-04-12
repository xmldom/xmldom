'use strict'

const { DOMImplementation } = require('../../lib')

describe('Node.prototype', () => {
	describe('textContent', () => {
		const impl = new DOMImplementation()
		const doc = impl.createDocument(null, '')

		describe('on Element', () => {
			test('returns empty string when element has no children', () => {
				const el = doc.createElement('root')
				expect(el.textContent).toBe('')
			})
			test('returns data of a Text child', () => {
				const el = doc.createElement('root')
				el.appendChild(doc.createTextNode('hello'))
				expect(el.textContent).toBe('hello')
			})
			test('returns data of a CDATASection child', () => {
				const el = doc.createElement('root')
				el.appendChild(doc.createCDATASection('raw<data>'))
				expect(el.textContent).toBe('raw<data>')
			})
			test('excludes Comment nodes', () => {
				const el = doc.createElement('root')
				el.appendChild(doc.createComment('ignored'))
				expect(el.textContent).toBe('')
			})
			test('excludes ProcessingInstruction nodes', () => {
				const el = doc.createElement('root')
				el.appendChild(doc.createProcessingInstruction('pi', 'ignored'))
				expect(el.textContent).toBe('')
			})
			test('concatenates text from nested elements in document order', () => {
				const el = doc.createElement('root')
				const child = doc.createElement('child')
				child.appendChild(doc.createTextNode('world'))
				el.appendChild(doc.createTextNode('hello '))
				el.appendChild(child)
				expect(el.textContent).toBe('hello world')
			})
			test('concatenates only text across mixed content (text + comment + text)', () => {
				const el = doc.createElement('root')
				el.appendChild(doc.createTextNode('a'))
				el.appendChild(doc.createComment('ignored'))
				el.appendChild(doc.createTextNode('b'))
				expect(el.textContent).toBe('ab')
			})
			test('concatenates only text across mixed content (text + PI + text)', () => {
				const el = doc.createElement('root')
				el.appendChild(doc.createTextNode('a'))
				el.appendChild(doc.createProcessingInstruction('pi', 'ignored'))
				el.appendChild(doc.createTextNode('b'))
				expect(el.textContent).toBe('ab')
			})
		})

		describe('on DocumentFragment', () => {
			test('returns empty string for an empty fragment', () => {
				const frag = doc.createDocumentFragment()
				expect(frag.textContent).toBe('')
			})
			test('concatenates text, excludes Comment and ProcessingInstruction descendants', () => {
				const frag = doc.createDocumentFragment()
				frag.appendChild(doc.createTextNode('a'))
				frag.appendChild(doc.createComment('ignored'))
				frag.appendChild(doc.createProcessingInstruction('pi', 'ignored'))
				frag.appendChild(doc.createTextNode('b'))
				expect(frag.textContent).toBe('ab')
			})
		})

		describe('on other node types (returns nodeValue)', () => {
			test('Text node returns its data', () => {
				const node = doc.createTextNode('hello')
				expect(node.textContent).toBe('hello')
			})
			test('CDATASection node returns its data', () => {
				const node = doc.createCDATASection('raw<data>')
				expect(node.textContent).toBe('raw<data>')
			})
			test('Comment node returns its own data', () => {
				const node = doc.createComment('comment text')
				expect(node.textContent).toBe('comment text')
			})
			test('ProcessingInstruction node returns its data', () => {
				const node = doc.createProcessingInstruction('target', 'pi data')
				expect(node.textContent).toBe('pi data')
			})
			test('Attr node returns its value', () => {
				const el = doc.createElement('el')
				el.setAttribute('name', 'attr value')
				const node = el.getAttributeNode('name')
				expect(node.textContent).toBe('attr value')
			})
			test('Document node returns null', () => {
				const d = impl.createDocument(null, null)
				expect(d.textContent).toBeNull()
			})
			test('DocumentType node returns null', () => {
				const doctype = impl.createDocumentType('html', '', '')
				expect(doctype.textContent).toBeNull()
			})
		})
	})

	describe('cloneNode', () => {
		const impl = new DOMImplementation()
		const doc = impl.createDocument(null, '')

		test('returns a new object, not the same reference', () => {
			const el = doc.createElement('el')
			expect(el.cloneNode(false)).not.toBe(el)
		})
		test('shallow clone (false) does not include children', () => {
			const el = doc.createElement('parent')
			el.appendChild(doc.createElement('child'))
			expect(el.cloneNode(false).firstChild).toBeNull()
		})
		test('deep clone (true) includes all descendants', () => {
			const el = doc.createElement('parent')
			const child = doc.createElement('child')
			child.appendChild(doc.createTextNode('text'))
			el.appendChild(child)
			const clone = el.cloneNode(true)
			expect(clone.firstChild.nodeName).toBe('child')
			expect(clone.firstChild.firstChild.nodeValue).toBe('text')
		})
		test('attributes are cloned for Element', () => {
			const el = doc.createElement('el')
			el.setAttribute('foo', 'bar')
			expect(el.cloneNode(false).getAttribute('foo')).toBe('bar')
		})
		test('modifying clone attributes does not affect original', () => {
			const el = doc.createElement('el')
			el.setAttribute('foo', 'original')
			el.cloneNode(false).setAttribute('foo', 'modified')
			expect(el.getAttribute('foo')).toBe('original')
		})
		test('modifying clone children does not affect original', () => {
			const el = doc.createElement('parent')
			el.appendChild(doc.createElement('child'))
			const clone = el.cloneNode(true)
			clone.removeChild(clone.firstChild)
			expect(el.firstChild).not.toBeNull()
		})
		test('ownerDocument is preserved', () => {
			const el = doc.createElement('el')
			expect(el.cloneNode(false).ownerDocument).toBe(doc)
		})
		test('Text node: clones nodeValue', () => {
			const node = doc.createTextNode('hello')
			const clone = node.cloneNode()
			expect(clone.nodeValue).toBe('hello')
			expect(clone).not.toBe(node)
		})
		test('CDATASection node: clones data', () => {
			const node = doc.createCDATASection('raw<data>')
			const clone = node.cloneNode()
			expect(clone.nodeValue).toBe('raw<data>')
			expect(clone.nodeType).toBe(node.nodeType)
		})
		test('Comment node: clones data', () => {
			const node = doc.createComment('a comment')
			const clone = node.cloneNode()
			expect(clone.nodeValue).toBe('a comment')
			expect(clone.nodeType).toBe(node.nodeType)
		})
		test('DocumentFragment: deep clone includes children', () => {
			const frag = doc.createDocumentFragment()
			frag.appendChild(doc.createTextNode('a'))
			frag.appendChild(doc.createElement('el'))
			const clone = frag.cloneNode(true)
			expect(clone.childNodes.length).toBe(2)
			expect(clone.firstChild.nodeValue).toBe('a')
		})
	})
})
