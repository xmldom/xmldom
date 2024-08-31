import {
	Document,
	DOMImplementation,
	DOMException,
	DOMExceptionName,
	DOMParser,
	ExceptionCode,
	hasDefaultHTMLNamespace,
	isHTMLMimeType,
	isValidMimeType,
	MIME_TYPE,
	NAMESPACE,
	onWarningStopParsing,
	ParseError,
	XMLSerializer, Node, DocumentType
} from "@xmldom/xmldom";

// lib/conventions

isHTMLMimeType(MIME_TYPE.HTML);
hasDefaultHTMLNamespace(MIME_TYPE.XML_XHTML_APPLICATION);
isValidMimeType(MIME_TYPE.XML_SVG_IMAGE);
isValidMimeType(MIME_TYPE.XML_APPLICATION);

// lib/errors

const domException = new DOMException();
domException.code; // 0
domException.name; // "Error"
domException.message; // ""
domException.INDEX_SIZE_ERR;
new DOMException('message', DOMExceptionName.SyntaxError);
new DOMException(DOMException.DATA_CLONE_ERR);
new DOMException(ExceptionCode.INDEX_SIZE_ERR, 'message');

const parseError = new ParseError('message');
parseError.message;
parseError.cause;
parseError.locator;
new ParseError('message', {}, domException);

// lib/dom
Node.ATTRIBUTE_NODE
Node.DOCUMENT_POSITION_CONTAINS


const impl = new DOMImplementation();
const document = impl.createDocument(null, 'qualifiedName');
document.contentType;
document.type;
document.ATTRIBUTE_NODE;
document.DOCUMENT_POSITION_CONTAINS;
document instanceof Node;
document instanceof Document;

impl.createDocument(
	NAMESPACE.XML,
	'qualifiedName',
	impl.createDocumentType('qualifiedName')
);
const doctype = impl.createDocumentType('qualifiedName', 'publicId', 'systemId');
document instanceof Node;
document instanceof DocumentType;

impl.createDocumentType('qualifiedName', 'publicId');
impl.createHTMLDocument();
impl.createHTMLDocument(false);
impl.createHTMLDocument('title');

const source = `<xml xmlns="a">
	<child>test</child>
	<child/>
</xml>`;
const doc = new DOMParser({
	onError: onWarningStopParsing,
}).parseFromString(source, MIME_TYPE.XML_TEXT);

const serialized = new XMLSerializer().serializeToString(doc);

if (source !== serialized) {
	throw `expected\n${source}\nbut was\n${serialized}`;
} else {
	console.log(serialized);
}
