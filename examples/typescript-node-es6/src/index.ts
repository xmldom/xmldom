import {
	Attr,
	CDATASection,
	CharacterData,
	Comment,
	Document,
	DocumentType,
	DOMException,
	DOMExceptionName,
	DOMImplementation,
	DOMParser,
	ExceptionCode,
	hasDefaultHTMLNamespace,
	isHTMLMimeType,
	isValidMimeType,
	LiveNodeList,
	MIME_TYPE,
	NamedNodeMap,
	NAMESPACE,
	Node,
	NodeList,
	onWarningStopParsing,
	ParseError,
	Text,
	XMLSerializer,
	Element,
	ProcessingInstruction,
} from '@xmldom/xmldom';

const failedAssertions: Error[] = [];
let assertions = 0;
const assert = <T>(
	actual: T,
	expected: T,
	message: string = `#${++assertions}`
) => {
	if (actual === expected) {
		console.error(`assert ${message} passed: ${actual}`);
	} else {
		failedAssertions.push(
			new Error(
				`assert ${message} failed: expected ${JSON.stringify(expected)}, but was ${JSON.stringify(
					actual
				)}`
			)
		);
	}
};

// lib/conventions
// widen type to string to check that any string can be passed
const mimeHtml: string = MIME_TYPE.HTML;
assert(isHTMLMimeType(mimeHtml), true);
assert(isHTMLMimeType(MIME_TYPE.HTML), true);
assert(hasDefaultHTMLNamespace(mimeHtml), true);
assert(hasDefaultHTMLNamespace(MIME_TYPE.XML_XHTML_APPLICATION), true);
assert(isValidMimeType(mimeHtml), true);
assert(isValidMimeType(MIME_TYPE.XML_SVG_IMAGE), true);
assert(isValidMimeType(MIME_TYPE.XML_APPLICATION), true);

// lib/errors

const domException = new DOMException();
assert(domException.code, 0);
assert(domException.name, 'Error');
assert(domException.message, undefined);
new DOMException('message', DOMExceptionName.SyntaxError);
new DOMException(DOMException.DATA_CLONE_ERR);
new DOMException(ExceptionCode.INDEX_SIZE_ERR, 'message');

const parseError = new ParseError('message');
assert(parseError.message, 'message');
new ParseError('message', {}, domException);

// lib/dom
assert(Node.ATTRIBUTE_NODE, 2);
assert(Node.DOCUMENT_POSITION_CONTAINS, 8);

// there are no real Node instances,
// but we want to check that the Node type provides these props
const fakeNode = {} as unknown as Node;
assert(fakeNode.nodeType, undefined);
assert(fakeNode.lineNumber, undefined);
assert(fakeNode.columnNumber, undefined);
assert(fakeNode.textContent, undefined);

assert(new NodeList().length, 0);

const impl = new DOMImplementation();
const doc1 = impl.createDocument(null, 'qualifiedName');
assert(doc1.contentType, MIME_TYPE.XML_APPLICATION);
assert(doc1.type, 'xml');
assert(doc1.ATTRIBUTE_NODE, 2);
assert(doc1.DOCUMENT_POSITION_CONTAINS, 8);
assert(doc1 instanceof Node, true);
assert(doc1 instanceof Document, true);
assert(doc1.childNodes instanceof NodeList, true);
assert(doc1.documentElement instanceof Element, true);
assert(doc1.documentElement?.tagName, 'qualifiedName');
assert(doc1.getElementsByClassName('hide') instanceof LiveNodeList, true);

const attr = doc1.createAttribute('attr');
assert(attr.nodeType, Node.ATTRIBUTE_NODE);
assert(attr.ownerDocument, doc1);
assert(attr.value, undefined);
assert(attr instanceof Attr, true);

const element = doc1.createElement('a');
assert(element.nodeType, Node.ELEMENT_NODE);
assert(element.ownerDocument, doc1);
assert(element.attributes instanceof NamedNodeMap, true);

const pi = doc1.createProcessingInstruction('target', 'data');
assert(pi.nodeType, Node.PROCESSING_INSTRUCTION_NODE);
assert(pi.target, 'target');
assert(pi.data, 'data');
assert(pi.target, pi.nodeName);
assert(pi.data, pi.nodeValue);
assert(pi instanceof ProcessingInstruction, true);
assert(pi instanceof CharacterData, true);

const cdata = doc1.createCDATASection('< &');
assert(cdata instanceof CharacterData, true);
assert(cdata instanceof CDATASection, true);
const comment = doc1.createComment('< &');
assert(comment instanceof CharacterData, true);
assert(comment instanceof Comment, true);
const text = doc1.createTextNode('text');
assert(text instanceof CharacterData, true);
assert(text instanceof Text, true);

impl.createDocument(
	NAMESPACE.XML,
	'qualifiedName',
	impl.createDocumentType('qualifiedName')
);
const doctype = impl.createDocumentType(
	'qualifiedName',
	'publicId',
	'systemId'
);
assert(doctype instanceof Node, true);
assert(doctype instanceof DocumentType, true);
impl.createDocumentType('qualifiedName', 'publicId');
assert(impl.createHTMLDocument().type, 'html');
assert(impl.createHTMLDocument(false).childNodes.length, 0);
assert(impl.createHTMLDocument('title').childNodes.length, 2);

assert(
	new DOMParser().parseFromString(`<div/>`, mimeHtml).childNodes.length,
	1
);

const source = `<xml xmlns="a">
	<child>test</child>
	<child/>
</xml>`;
const doc = new DOMParser({
	onError: onWarningStopParsing,
}).parseFromString(source, MIME_TYPE.XML_TEXT);
assert(new XMLSerializer().serializeToString(doc), source);

if (failedAssertions.length > 0) {
	failedAssertions.forEach((error) => console.error(error));
	process.exit(1);
}
