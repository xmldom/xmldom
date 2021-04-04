'use strict'

const {
	DocumentType,
	DOMImplementation,
	Element,
	Node,
	NodeList,
} = require('../../lib/dom')

const NAME = 'NAME'
const PREFIX = 'PREFIX'
const NS = 'NS'

describe('DOMImplementation', () => {
	describe('hasFeature (deprecated)', () => {
		it.each(['', '0', 'feature'])(
			"should return true when called with ('%s')",
			(f) => {
				expect(new DOMImplementation().hasFeature(f)).toBe(true)
			}
		)
		it.each([
			['', ''],
			['0', '1'],
			['feature', ''],
			['feature', '1'],
		])("should return true when called with ('%s', '%s')", (f, v) => {
			expect(new DOMImplementation().hasFeature(f, v)).toBe(true)
		})
	})

	describe('createDocument', () => {
		it('should create a Document with basic mandatory arguments', () => {
			const impl = new DOMImplementation()
			const doc = impl.createDocument(null, '')

			expect(doc.nodeType).toBe(Node.DOCUMENT_NODE)
			expect(doc.implementation).toBe(impl)
			expect(doc.doctype).toBe(null)
			expect(doc.childNodes).toBeInstanceOf(NodeList)
			expect(doc.documentElement).toBe(null)
		})

		it('should create a Document with only a doc type', () => {
			const impl = new DOMImplementation()
			const doctype = impl.createDocumentType('test')
			const doc = impl.createDocument(null, '', doctype)

			expect(doc.doctype).toBe(doctype)
			expect(doctype.ownerDocument).toBe(doc)
			expect(doc.childNodes.item(0)).toBe(doctype)
		})

		it('should create a Document with root element without a namespace', () => {
			const impl = new DOMImplementation()
			const doc = impl.createDocument(null, NAME)

			const root = doc.childNodes.item(0)
			expect(root).toBeInstanceOf(Element)
			expect(root.ownerDocument).toBe(doc)
			expect(root.namespaceURI).toBe(null)
			expect(root.nodeName).toBe(NAME)
			expect(root.tagName).toBe(NAME)
			expect(root.prefix).toBe(null)
			expect(root.localName).toBe(NAME)
			expect(doc.documentElement).toBe(root)
		})

		it('should create a Document with root element in a default namespace', () => {
			const impl = new DOMImplementation()
			const doc = impl.createDocument(NS, NAME)

			const root = doc.childNodes.item(0)
			expect(root).toBeInstanceOf(Element)
			expect(root.ownerDocument).toBe(doc)
			expect(root.namespaceURI).toBe(NS)
			expect(root.prefix).toBe(null)
			expect(root.localName).toBe(NAME)
			expect(root.nodeName).toBe(NAME)
			expect(root.tagName).toBe(NAME)

			expect(doc.documentElement).toBe(root)
		})

		it('should create a Document with root element in a named namespace', () => {
			const impl = new DOMImplementation()
			const qualifiedName = `${PREFIX}:${NAME}`
			const doc = impl.createDocument(NS, qualifiedName)

			const root = doc.childNodes.item(0)
			expect(root).toBeInstanceOf(Element)
			expect(root.ownerDocument).toBe(doc)
			expect(root.namespaceURI).toBe(NS)
			expect(root.prefix).toBe(PREFIX)
			expect(root.localName).toBe(NAME)
			expect(root.nodeName).toBe(qualifiedName)
			expect(root.tagName).toBe(qualifiedName)

			expect(doc.documentElement).toBe(root)
		})

		it('should create a Document with root element in a named namespace', () => {
			const impl = new DOMImplementation()
			const qualifiedName = `${PREFIX}:${NAME}`
			const doc = impl.createDocument(NS, qualifiedName)

			const root = doc.childNodes.item(0)
			expect(root).toBeInstanceOf(Element)
			expect(root.ownerDocument).toBe(doc)
			expect(root.namespaceURI).toBe(NS)
			expect(root.prefix).toBe(PREFIX)
			expect(root.localName).toBe(NAME)
			expect(root.nodeName).toBe(qualifiedName)
			expect(root.tagName).toBe(qualifiedName)

			expect(doc.documentElement).toBe(root)
		})

		it('should create a Document with namespaced root element and doctype', () => {
			const impl = new DOMImplementation()
			const qualifiedName = `${PREFIX}:${NAME}`
			const doctype = impl.createDocumentType('test')
			const doc = impl.createDocument(NS, qualifiedName, doctype)

			expect(doc.doctype).toBe(doctype)
			expect(doctype.ownerDocument).toBe(doc)
			expect(doc.childNodes.item(0)).toBe(doctype)

			const root = doc.childNodes.item(1)
			expect(root).toBeInstanceOf(Element)
			expect(root.ownerDocument).toBe(doc)
			expect(root.namespaceURI).toBe(NS)
			expect(root.prefix).toBe(PREFIX)
			expect(root.localName).toBe(NAME)
			expect(root.nodeName).toBe(qualifiedName)
			expect(root.tagName).toBe(qualifiedName)

			expect(doc.documentElement).toBe(root)
		})
	})

	describe('createDocumentType', () => {
		it('should create a DocumentType with only a name', () => {
			const impl = new DOMImplementation()
			const doctype = impl.createDocumentType(NAME)

			expect(doctype).toBeInstanceOf(Node)
			expect(doctype).toBeInstanceOf(DocumentType)
			expect(doctype.nodeType).toBe(Node.DOCUMENT_TYPE_NODE)
			expect(doctype.name).toBe(NAME)
			expect(doctype.publicId).toBe('')
			expect(doctype.systemId).toBe('')
		})

		it('should create a DocumentType with name, publicId and systemId', () => {
			const impl = new DOMImplementation()
			const doctype = impl.createDocumentType(NAME, '"PUBLIC"', '"SYSTEM"')

			expect(doctype.name).toBe(NAME)
			expect(doctype.publicId).toBe('"PUBLIC"')
			expect(doctype.systemId).toBe('"SYSTEM"')
		})
	})
})
