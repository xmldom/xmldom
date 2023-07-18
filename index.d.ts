/// <reference lib="dom" />

declare module '@xmldom/xmldom' {
	// START ./lib/conventions.js
	/**
	 * Since xmldom can not rely on `Object.assign`,
	 * it uses/provides a simplified version that is sufficient for its needs.
	 *
	 * @throws {TypeError}
	 * If target is not an object.
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	 * @see https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.assign
	 */
	function assign<T, S>(target: T, source: S): T & S;
	/**
	 * Only returns true if `value` matches MIME_TYPE.HTML, which indicates an HTML document.
	 *
	 * @see https://www.iana.org/assignments/media-types/text/html
	 * @see https://en.wikipedia.org/wiki/HTML
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
	 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
	 */
	function isHtmlMimeType(mimeType: string): mimeType is MIME_TYPE.HTML;
	/**
	 * Only returns true if `mimeType` is one of the allowed values for `DOMParser.parseFromString`.
	 */
	function isValidMimeType(mimeType: string): mimeType is MIME_TYPE;

	/**
	 * All mime types that are allowed as input to `DOMParser.parseFromString`
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#Argument02
	 *      MDN
	 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#domparsersupportedtype
	 *   WHATWG HTML Spec
	 * @see {@link DOMParser.prototype.parseFromString}
	 */
	enum MIME_TYPE {
		/**
		 * `text/html`, the only mime type that triggers treating an XML document as HTML.
		 *
		 * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
		 * @see https://en.wikipedia.org/wiki/HTML Wikipedia
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
		 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
		 *   WHATWG HTML Spec
		 */
		HTML = 'text/html',
		/**
		 * `application/xml`, the standard mime type for XML documents.
		 *
		 * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType
		 *      registration
		 * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
		 * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
		 */
		XML_APPLICATION = 'application/xml',
		/**
		 * `text/html`, an alias for `application/xml`.
		 *
		 * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
		 * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
		 * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
		 */
		XML_TEXT = 'text/xml',
		/**
		 * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
		 * but is parsed as an XML document.
		 *
		 * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType
		 *      registration
		 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
		 * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
		 */
		XML_XHTML_APPLICATION = 'application/xhtml+xml',
		/**
		 * `image/svg+xml`,
		 *
		 * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
		 * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
		 * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
		 */
		XML_SVG_IMAGE = 'image/svg+xml',
	}
	/**
	 * Namespaces that are used in xmldom.
	 *
	 * @see http://www.w3.org/TR/REC-xml-names
	 */
	enum NAMESPACE {
		/**
		 * The XHTML namespace.
		 *
		 * @see http://www.w3.org/1999/xhtml
		 */
		HTML = 'http://www.w3.org/1999/xhtml',
		/**
		 * The SVG namespace.
		 *
		 * @see http://www.w3.org/2000/svg
		 */
		SVG = 'http://www.w3.org/2000/svg',
		/**
		 * The `xml:` namespace.
		 *
		 * @see http://www.w3.org/XML/1998/namespace
		 */
		XML = 'http://www.w3.org/XML/1998/namespace',

		/**
		 * The `xmlns:` namespace.
		 *
		 * @see https://www.w3.org/2000/xmlns/
		 */
		XMLNS = 'http://www.w3.org/2000/xmlns/',
	}

	/**
	 * A custom error that will not be caught by XMLReader aka the SAX parser.
	 */
	class ParseError extends Error {
		constructor(message: string, locator?: any);
	}
	// END ./lib/conventions.js

	// START ./lib/dom.js
	/**
	 * The error class for errors reported by the DOM API.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMException
	 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
	 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
	 */
	class DOMException extends Error {
		constructor(code: number, message: string);
	}

	interface DOMImplementation {
		/**
		 * The DOMImplementation interface represents an object providing methods which are not
		 * dependent on any particular document.
		 * Such an object is returned by the `Document.implementation` property.
		 *
		 * __The individual methods describe the differences compared to the specs.__.
		 *
		 * @class
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation MDN
		 * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490 DOM Level 1
		 *      Core (Initial)
		 * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-102161490 DOM Level 2 Core
		 * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-102161490 DOM Level 3 Core
		 * @see https://dom.spec.whatwg.org/#domimplementation DOM Living Standard
		 */
		new (): DOMImplementation;

		/**
		 * Creates an XML Document object of the specified type with its document element.
		 *
		 * __It behaves slightly different from the description in the living standard__:
		 * - There is no interface/class `XMLDocument`, it returns a `Document` instance (with it's
		 * `type` set to `'xml'`).
		 * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
		 *
		 * @returns {Document} The XML document.
		 * @see {@link DOMImplementation.createHTMLDocument}
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
		 * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM
		 *      Level 2 Core (initial)
		 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument DOM Level 2 Core
		 */
		createDocument(
			namespaceURI: string | null,
			qualifiedName: string,
			doctype?: DocumentType | null
		): Document;

		/**
		 * Returns a doctype, with the given `qualifiedName`, `publicId`, and `systemId`.
		 *
		 * __This behavior is slightly different from the in the specs__:
		 * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
		 *
		 * @returns {DocumentType} which can either be used with `DOMImplementation.createDocument`
		 *                         upon document creation or can be put into the document via methods
		 *                         like `Node.insertBefore()` or `Node.replaceChild()`
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocumentType
		 *      MDN
		 * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocType DOM
		 *      Level 2 Core
		 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocumenttype DOM Living
		 *      Standard
		 */
		createDocumentType(
			qualifiedName: string,
			publicId?: string,
			systemId?: string
		): DocumentType;

		/**
		 * Returns an HTML document, that might already have a basic DOM structure.
		 *
		 * __It behaves slightly different from the description in the living standard__:
		 * - If the first argument is `false` no initial nodes are added (steps 3-7 in the specs are
		 * omitted)
		 * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
		 *
		 * @see {@link DOMImplementation.createDocument}
		 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createhtmldocument
		 * @see https://dom.spec.whatwg.org/#html-document
		 */
		createHTMLDocument(title?: string | false): Document;

		/**
		 * The DOMImplementation.hasFeature() method returns a Boolean flag indicating if a given
		 * feature is supported. The different implementations fairly diverged in what kind of
		 * features were reported. The latest version of the spec settled to force this method to
		 * always return true, where the functionality was accurate and in use.
		 *
		 * @deprecated
		 * It is deprecated and modern browsers return true in all cases.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/hasFeature MDN
		 * @see https://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-5CED94D7 DOM Level 1
		 *      Core
		 * @see https://dom.spec.whatwg.org/#dom-domimplementation-hasfeature DOM Living Standard
		 */
		hasFeature(feature: string, version?: string): true;
	}

	var XMLSerializer: XMLSerializerStatic;
	interface XMLSerializerStatic {
		new (): XMLSerializer;
	}
	// END ./lib/dom.js

	// START ./lib/dom-parser.js
	var DOMParser: DOMParserStatic;
	interface DOMParserStatic {
		/**
		 * The DOMParser interface provides the ability to parse XML or HTML source code from a
		 * string into a DOM `Document`.
		 *
		 * _xmldom is different from the spec in that it allows an `options` parameter,
		 * to control the behavior._.
		 *
		 * @class
		 * @param {DOMParserOptions} [options]
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
		 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-parsing-and-serialization
		 */
		new (options?: DOMParserOptions): DOMParser;
	}

	/**
	 * The DOMParser interface provides the ability to parse XML or HTML source code from a string
	 * into a DOM `Document`.
	 *
	 * _xmldom is different from the spec in that it allows an `options` parameter,
	 * to control the behavior._.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
	 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-parsing-and-serialization
	 */
	interface DOMParser {
		/**
		 * Parses `source` using the options in the way configured by the `DOMParserOptions` of
		 * `this`
		 * `DOMParser`. If `mimeType` is `text/html` an HTML `Document` is created, otherwise an XML
		 * `Document` is created.
		 *
		 * __It behaves different from the description in the living standard__:
		 * - Uses the `options` passed to the `DOMParser` constructor to modify the behavior.
		 * - Any unexpected input is reported to `onError` with either a `warning`, `error` or
		 * `fatalError` level.
		 * - Any `fatalError` throws a `ParseError` which prevents further processing.
		 * - Any error thrown by `onError` is converted to a `ParseError` which prevents further
		 * processing - If no `Document` was created during parsing it is reported as a `fatalError`.
		 *
		 * @returns The `Document` node.
		 * @throws {ParseError}
		 * for any `fatalError` or anything that is thrown by `onError`
		 * @throws {TypeError} for any invalid `mimeType`
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
		 * @see https://html.spec.whatwg.org/#dom-domparser-parsefromstring-dev
		 */
		parseFromString(
			source: string,
			mimeType: MIME_TYPE = MIME_TYPE.XML_TEXT
		): Document;
	}

	interface XMLSerializer {
		serializeToString(node: Node, nodeFilter?: (node: Node) => boolean): string;
	}

	interface DOMParserOptions {
		/**
		 * The method to use instead of `Object.assign` (defaults to `conventions.assign`),
		 * which is used to copy values from the options before they are used for parsing.
		 *
		 * @private
		 * @see {@link conventions.assign}
		 */
		readonly assign?: typeof Object.assign;
		/**
		 * For internal testing: The class for creating an instance for handling events from the SAX
		 * parser.
		 * *****Warning: By configuring a faulty implementation,
		 * the specified behavior can completely be broken*****.
		 *
		 * @private
		 */
		readonly domHandler?: unknown;

		/**
		 * DEPRECATED: Use `onError` instead!
		 *
		 * For backwards compatibility:
		 * If it is a function, it will be used as a value for `onError`,
		 * but it receives different argument types than before 0.9.0.
		 *
		 * @deprecated
		 * @throws {TypeError} If it is an object.
		 */
		readonly errorHandler?: ErrorHandlerFunction;

		/**
		 * Configures if the nodes created during parsing
		 * will have a `lineNumber` and a `columnNumber` attribute
		 * describing their location in the XML string.
		 * Default is true.
		 */
		readonly locator?: boolean;

		/**
		 * used to replace line endings before parsing, defaults to `normalizeLineEndings`,
		 * which normalizes line endings according to <https://www.w3.org/TR/xml11/#sec-line-ends>.
		 */
		readonly normalizeLineEndings?: (source: string) => string;
		/**
		 * A function that is invoked for every error that occurs during parsing.
		 *
		 * If it is not provided, all errors are reported to `console.error`
		 * and only `fatalError`s are thrown as a `ParseError`,
		 * which prevents any further processing.
		 * If the provided method throws, a `ParserError` is thrown,
		 * which prevents any further processing.
		 *
		 * Be aware that many `warning`s are considered an error that prevents further processing in
		 * most implementations.
		 *
		 * @param level
		 * The error level as reported by the SAXParser.
		 * @param message
		 * The error message.
		 * @param context
		 * The DOMHandler instance used for parsing.
		 * @see {@link onErrorStopParsing}
		 * @see {@link onWarningStopParsing}
		 */
		readonly onError?: ErrorHandlerFunction;

		/**
		 * The XML namespaces that should be assumed when parsing.
		 * The default namespace can be provided by the key that is the empty string.
		 * When the `mimeType` for HTML, XHTML or SVG are passed to `parseFromString`,
		 * the default namespace that will be used,
		 * will be overridden according to the specification.
		 */
		readonly xmlns?: Readonly<Record<string, string | null | undefined>>;
	}

	interface ErrorHandlerFunction {
		(level: 'warn' | 'error' | 'fatalError', msg: string, context: any): void;
	}

	/**
	 * A method that prevents any further parsing when an `error`
	 * with level `error` is reported during parsing.
	 *
	 * @see {@link DOMParserOptions.onError}
	 * @see {@link onWarningStopParsing}
	 */
	function onErrorStopParsing(): void | never;
	/**
	 * A method that prevents any further parsing when an `error`
	 * with any level is reported during parsing.
	 *
	 * @see {@link DOMParserOptions.onError}
	 * @see {@link onErrorStopParsing}
	 */
	function onWarningStopParsing(): never;
	// END ./lib/dom-parser.js
}
