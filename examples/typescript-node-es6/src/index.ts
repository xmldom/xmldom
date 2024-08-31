import {
	DOMParser,
	hasDefaultHTMLNamespace,
	isHTMLMimeType,
	isValidMimeType,
	MIME_TYPE,
	NAMESPACE,
	onWarningStopParsing,
	XMLSerializer,
	DOMImplementation,
	DOMException,
	DOMExceptionName,
	ExceptionCode,
	ParseError,
} from '@xmldom/xmldom';

isHTMLMimeType(MIME_TYPE.HTML);
hasDefaultHTMLNamespace(MIME_TYPE.XML_XHTML_APPLICATION);
isValidMimeType(MIME_TYPE.XML_SVG_IMAGE);
isValidMimeType(MIME_TYPE.XML_APPLICATION);

const impl = new DOMImplementation();
impl.createDocument(null, 'qualifiedName');
impl.createDocument(
	NAMESPACE.XML,
	'qualifiedName',
	impl.createDocumentType('qualifiedName')
);
impl.createDocumentType('qualifiedName', 'publicId', 'systemId');
impl.createDocumentType('qualifiedName', 'publicId');
impl.createHTMLDocument();
impl.createHTMLDocument(false);
impl.createHTMLDocument('title');

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
