'use strict'

const {
	DocumentType,
	DOMImplementation,
	Element,
	Node,
	NodeList,
} = require('../../lib/dom')
const { NAMESPACE, MIME_TYPE } = require('../../lib/conventions')

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
			expect(doc.contentType).toBe(MIME_TYPE.XML_APPLICATION)
			expect(doc.type).toBe('xml')
		})

		it('should create a Document with only a doc type', () => {
			const impl = new DOMImplementation()
			const doctype = impl.createDocumentType('test')
			const doc = impl.createDocument(null, '', doctype)

			expect(doc.doctype).toBe(doctype)
			expect(doctype.ownerDocument).toBe(doc)
			expect(doc.childNodes.item(0)).toBe(doctype)
			expect(doc.contentType).toBe(MIME_TYPE.XML_APPLICATION)
			expect(doc.type).toBe('xml')
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
			expect(doc.contentType).toBe(MIME_TYPE.XML_APPLICATION)
			expect(doc.type).toBe('xml')
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
			expect(doc.contentType).toBe(MIME_TYPE.XML_APPLICATION)
			expect(doc.type).toBe('xml')
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
			expect(doc.contentType).toBe(MIME_TYPE.XML_APPLICATION)
			expect(doc.type).toBe('xml')
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
			expect(doc.contentType).toBe(MIME_TYPE.XML_APPLICATION)
			expect(doc.type).toBe('xml')
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
			expect(doc.contentType).toBe(MIME_TYPE.XML_APPLICATION)
			expect(doc.type).toBe('xml')
		})

		it('should create SVG document from the SVG namespace', () => {
			const impl = new DOMImplementation()
			const doc = impl.createDocument(NAMESPACE.SVG, 'svg')
			expect(doc.contentType).toBe(MIME_TYPE.XML_SVG_IMAGE)
			expect(doc.type).toBe('xml')
		})

		it('should create XHTML document from the HTML namespace', () => {
			const impl = new DOMImplementation()
			const doc = impl.createDocument(NAMESPACE.HTML, 'svg')
			expect(doc.contentType).toBe(MIME_TYPE.XML_XHTML_APPLICATION)
			expect(doc.type).toBe('xml')
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
	describe('createHTMLDocument', () => {
		it('should create an empty HTML document without any elements', () => {
			const impl = new DOMImplementation()
			const doc = impl.createHTMLDocument(false)

			expect(doc.implementation).toBe(impl)
			expect(doc.contentType).toBe(MIME_TYPE.HTML)
			expect(doc.type).toBe('html')
			expect(doc.childNodes.length).toBe(0)
			expect(doc.doctype).toBeNull()
			expect(doc.documentElement).toBeNull()
		})
		it('should create an HTML document with minimum specified elements when title not provided', () => {
			const impl = new DOMImplementation()
			const doc = impl.createHTMLDocument()

			expect(doc.implementation).toBe(impl)
			expect(doc.contentType).toBe(MIME_TYPE.HTML)
			expect(doc.type).toBe('html')

			expect(doc.doctype).not.toBeNull()
			expect(doc.doctype.name).toBe('html')
			expect(doc.doctype.nodeName).toBe('html')
			expect(doc.doctype.ownerDocument).toBe(doc)
			expect(doc.childNodes.item(0)).toBe(doc.doctype)
			expect(doc.firstChild).toBe(doc.doctype)

			expect(doc.documentElement).not.toBeNull()
			expect(doc.documentElement.nodeName).toBe('html')
			expect(doc.documentElement.tagName).toBe('html')
			const htmlNode = doc.documentElement
			expect(htmlNode.firstChild).not.toBeNull()
			expect(htmlNode.firstChild.nodeName).toBe('head')
			expect(htmlNode.firstChild.childNodes).toHaveLength(0)

			expect(htmlNode.lastChild).not.toBeNull()
			expect(htmlNode.lastChild.nodeName).toBe('body')
			expect(htmlNode.lastChild.childNodes).toHaveLength(0)
		})
		it('should create an HTML document with specified elements including an empty title', () => {
			const impl = new DOMImplementation()
			const doc = impl.createHTMLDocument('')

			expect(doc.implementation).toBe(impl)
			expect(doc.contentType).toBe(MIME_TYPE.HTML)
			expect(doc.type).toBe('html')

			expect(doc.doctype).not.toBeNull()
			expect(doc.doctype.name).toBe('html')
			expect(doc.doctype.nodeName).toBe('html')
			expect(doc.doctype.ownerDocument).toBe(doc)
			expect(doc.childNodes.item(0)).toBe(doc.doctype)
			expect(doc.firstChild).toBe(doc.doctype)

			expect(doc.documentElement).not.toBeNull()
			expect(doc.documentElement.nodeName).toBe('html')
			expect(doc.documentElement.tagName).toBe('html')
			const htmlNode = doc.documentElement

			expect(htmlNode.firstChild).not.toBeNull()
			expect(htmlNode.firstChild.nodeName).toBe('head')
			const headNode = htmlNode.firstChild

			expect(headNode.firstChild).not.toBeNull()
			expect(headNode.firstChild.nodeName).toBe('title')
			expect(headNode.firstChild.firstChild).not.toBeNull()
			expect(headNode.firstChild.firstChild.ownerDocument).toBe(doc)
			expect(headNode.firstChild.firstChild.nodeType).toBe(Node.TEXT_NODE)
			expect(headNode.firstChild.firstChild.nodeValue).toBe('')
		})
		it('should create an HTML document with specified elements including an provided title', () => {
			const impl = new DOMImplementation()
			const doc = impl.createHTMLDocument('eltiT')

			expect(doc.implementation).toBe(impl)
			expect(doc.contentType).toBe(MIME_TYPE.HTML)
			expect(doc.type).toBe('html')

			expect(doc.documentElement).not.toBeNull()
			expect(doc.documentElement.nodeName).toBe('html')
			expect(doc.documentElement.tagName).toBe('html')
			const htmlNode = doc.documentElement

			expect(htmlNode.firstChild).not.toBeNull()
			expect(htmlNode.firstChild.nodeName).toBe('head')
			const headNode = htmlNode.firstChild

			expect(headNode.firstChild).not.toBeNull()
			expect(headNode.firstChild.nodeName).toBe('title')

			expect(headNode.firstChild.firstChild).not.toBeNull()
			expect(headNode.firstChild.firstChild.ownerDocument).toBe(doc)
			expect(headNode.firstChild.firstChild.nodeType).toBe(Node.TEXT_NODE)
			expect(headNode.firstChild.firstChild.nodeValue).toBe('eltiT')
		})
	})
})
