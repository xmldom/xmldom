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
	XMLSerializer
} from "@xmldom/xmldom";

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

assert(new NodeList().length, 0);

const impl = new DOMImplementation();
const document = impl.createDocument(null, 'qualifiedName');
assert(document.contentType, MIME_TYPE.XML_APPLICATION);
assert(document.type, 'xml');
assert(document.ATTRIBUTE_NODE, 2);
assert(document.DOCUMENT_POSITION_CONTAINS, 8);
assert(document instanceof Node, true);
assert(document instanceof Document, true);
assert(document.childNodes instanceof NodeList, true);
assert(document.getElementsByClassName('hide') instanceof LiveNodeList, true);

const attr = document.createAttribute('attr');
assert(attr.nodeType, Node.ATTRIBUTE_NODE);
assert(attr.ownerDocument, document);
assert(attr.value, undefined);
assert(attr instanceof Attr, true);

const element = document.createElement('a');
assert(element.nodeType, Node.ELEMENT_NODE);
assert(element.ownerDocument, document);
assert(element.attributes instanceof NamedNodeMap, true);

const cdata = document.createCDATASection('< &');
assert(cdata instanceof CharacterData, true);
assert(cdata instanceof CDATASection, true);
const comment = document.createComment('< &');
assert(comment instanceof CharacterData, true);
assert(comment instanceof Comment, true);
const text = document.createTextNode('text');
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
