'use strict';
var conventions = require('./conventions');
exports.assign = conventions.assign;
exports.hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
exports.isHTMLMimeType = conventions.isHTMLMimeType;
exports.isValidMimeType = conventions.isValidMimeType;
exports.MIME_TYPE = conventions.MIME_TYPE;
exports.NAMESPACE = conventions.NAMESPACE;

var errors = require('./errors');
exports.ParseError = errors.ParseError;
exports.DOMException = errors.DOMException;

var dom = require('./dom');
exports.DOMImplementation = dom.DOMImplementation;
exports.XMLSerializer = dom.XMLSerializer;
exports.DOM = {
	Attr: dom.Attr,
	CDATASection: dom.CDATASection,
	CharacterData: dom.CharacterData,
	Comment: dom.Comment,
	Document: dom.Document,
	DocumentFragment: dom.DocumentFragment,
	DocumentType: dom.DocumentType,
	DOMException: errors.DOMException,
	DOMImplementation: dom.DOMImplementation,
	Element: dom.Element,
	EntityReference: dom.EntityReference,
	Entity: dom.Entity,
	ExceptionCode: errors.ExceptionCode,
	NamedNodeMap: dom.NamedNodeMap,
	Node: dom.Node,
	NodeList: dom.NodeList,
	Notation: dom.Notation,
	ProcessingInstruction: dom.ProcessingInstruction,
	Text: dom.Text,
};

var domParser = require('./dom-parser');
exports.DOMParser = domParser.DOMParser;
exports.onErrorStopParsing = domParser.onErrorStopParsing;
exports.onWarningStopParsing = domParser.onWarningStopParsing;
