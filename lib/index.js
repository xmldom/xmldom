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
    DOMException: errors.DOMException,
    ExceptionCode: errors.ExceptionCode,
    DOMImplementation: dom.DOMImplementation,
    DocumentFragment: dom.DocumentFragment,
    Document: dom.Document,
    Node: dom.Node,
    NodeList: dom.NodeList,
    NamedNodeMap: dom.NamedNodeMap,
    CharacterData: dom.CharacterData,
    Attr: dom.Attr,
    Element: dom.Element,
    Text: dom.Text,
};

var domParser = require('./dom-parser');
exports.DOMParser = domParser.DOMParser;
exports.onErrorStopParsing = domParser.onErrorStopParsing;
exports.onWarningStopParsing = domParser.onWarningStopParsing;
