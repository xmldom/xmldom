'use strict';

var conventions = require('./conventions');
exports.assign = conventions.assign;
exports.hasDefaultHTMLNamespace = conventions.hasDefaultHTMLNamespace;
exports.isHTMLMimeType = conventions.isHTMLMimeType;
exports.isValidMimeType = conventions.isValidMimeType;
exports.MIME_TYPE = conventions.MIME_TYPE;
exports.NAMESPACE = conventions.NAMESPACE;
exports.ParseError = conventions.ParseError;

var dom = require('./dom');
exports.DOMException = dom.DOMException;
exports.DOMImplementation = dom.DOMImplementation;
exports.XMLSerializer = dom.XMLSerializer;

var domParser = require('./dom-parser');
exports.DOMParser = domParser.DOMParser;
exports.onErrorStopParsing = domParser.onErrorStopParsing;
exports.onWarningStopParsing = domParser.onWarningStopParsing;
