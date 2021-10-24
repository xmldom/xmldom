var conventions = require("./conventions");
var dom = require('./dom')
var entities = require('./entities');
var sax = require('./sax');

var DOMImplementation = dom.DOMImplementation;

var MIME_TYPE = conventions.MIME_TYPE;
var NAMESPACE = conventions.NAMESPACE;

var ParseError = sax.ParseError;
var XMLReader = sax.XMLReader;

/**
 * Normalizes line ending according to https://www.w3.org/TR/xml11/#sec-line-ends:
 *
 * > XML parsed entities are often stored in computer files which,
 * > for editing convenience, are organized into lines.
 * > These lines are typically separated by some combination
 * > of the characters CARRIAGE RETURN (#xD) and LINE FEED (#xA).
 * >
 * > To simplify the tasks of applications, the XML processor must behave
 * > as if it normalized all line breaks in external parsed entities (including the document entity)
 * > on input, before parsing, by translating all of the following to a single #xA character:
 * >
 * > 1. the two-character sequence #xD #xA
 * > 2. the two-character sequence #xD #x85
 * > 3. the single character #x85
 * > 4. the single character #x2028
 * > 5. any #xD character that is not immediately followed by #xA or #x85.
 *
 * @param {string} input
 * @returns {string}
 */
function normalizeLineEndings(input) {
	return input
		.replace(/\r[\n\u0085]/g, '\n')
		.replace(/[\r\u0085\u2028]/g, '\n')
}

/**
 * @typedef Locator
 * @property {number} [columnNumber]
 * @property {number} [lineNumber]
 */

/**
 * @typedef DOMParserOptions
 * @property {typeof conventions.assign} [assign=Object.assign || conventions.assign]
 * The method to use instead of `Object.assign` (or if not available `conventions.assign`),
 * which is used to copy values from the options before they are used for parsing.
 * @property {typeof DOMHandler} [domHandler]
 * For internal testing: The class for creating an instance for handling events from the SAX parser.
 * Warning: By configuring a faulty implementation, the specified behavior can completely be broken.
 * @property {Function} [errorHandler]
 * @property {boolean} [locator=true]
 * Configures if the nodes created during parsing
 * will have a `lineNumber` and a `columnNumber` attribute
 * describing their location in the XML string.
 * Default is true.
 * @property {(string) => string} [normalizeLineEndings]
 * used to replace line endings before parsing, defaults to `normalizeLineEndings`
 * @property {object} [xmlns]
 * The XML namespaces that should be assumed when parsing.
 * The default namespace can be provided by the key that is the empty string.
 * When the `mimeType` for HTML, XHTML or SVG are passed to `parseFromString`,
 * the default namespace that will be used,
 * will be overridden according to the specification.
 *
 * @see normalizeLineEndings
 */

/**
 * The DOMParser interface provides the ability to parse XML or HTML source code
 * from a string into a DOM `Document`.
 *
 * _xmldom is different from the spec in that it allows an `options` parameter,
 * to control the behavior._
 *
 * @param {DOMParserOptions} [options]
 * @constructor
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser
 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-parsing-and-serialization
 */
function DOMParser(options){
	/**
	 * @type {Readonly<DOMParserOptions>}
	 * @readonly
	 * @private
	 */
	this.options = options || {};

	/**
	 * The method to use instead of `Object.assign` (or if not available `conventions.assign`),
	 * which is used to copy values from the options before they are used for parsing.
	 *
	 * @type {function (target: object, source: object | null | undefined): object}
	 * @readonly
	 * @private
	 * @see conventions.assign
	 */
	this.assign = this.options.assign || Object.assign || conventions.assign

	/**
	 * For internal testing: The class for creating an instance for handling events from the SAX parser.
	 * __**Warning: By configuring a faulty implementation, the specified behavior can completely be broken.**__
	 *
	 * @type {typeof DOMHandler}
	 * @readonly
	 * @private
	 */
	this.domHandler = this.options.domHandler || DOMHandler

	/**
	 * A function that can be invoked as the errorHandler instead of the default ones.
	 * @type {Function | undefined}
	 * @readonly
	 */
	this.errorHandler = this.options.errorHandler;

	/**
	 * used to replace line endings before parsing, defaults to `normalizeLineEndings`
	 *
	 * @type {(string) => string}
	 * @readonly
	 */
	this.normalizeLineEndings = this.options.normalizeLineEndings || normalizeLineEndings

	/**
	 * Configures if the nodes created during parsing
	 * will have a `lineNumber` and a `columnNumber` attribute
	 * describing their location in the XML string.
	 * Default is true.
	 * @type {boolean}
	 * @readonly
	 */
	this.locator = !options || !!options.locator

	/**
	 * The default namespace can be provided by the key that is the empty string.
	 * When the `mimeType` for HTML, XHTML or SVG are passed to `parseFromString`,
	 * the default namespace that will be used,
	 * will be overridden according to the specification.
	 * @type {Readonly<object>}
	 * @readonly
	 */
	this.xmlns = this.options.xmlns || {}
}

/**
 * Parses `source` using the options in the way configured by the `DOMParserOptions` of `this` `DOMParser`.
 * If `mimeType` is `text/html` an HTML `Document` is created, otherwise an XML `Document` is created.
 *
 * __It behaves very different from the description in the living standard__:
 * - Only allows the first argument to be a string (calls `error` handler otherwise.)
 * - The second parameter is optional (defaults to `application/xml`) and can be any string,
 *   no `TypeError` will be thrown for values not listed in the spec.
 * - Uses the `options` passed to the `DOMParser` constructor to modify the behavior/implementation.
 * - Instead of creating a Document containing the error message,
 *   it triggers `errorHandler`(s) when unexpected input is found, which means it can return `undefined`.
 *   All error handlers can throw errors, by default only the `fatalError` handler throws (a `ParserError`).
 * - All errors thrown during the parsing that are not a `ParserError` are caught and reported using an error handler.
 * - If no `ParserError` is thrown, this method returns the `DOMHandler.doc`,
 *   which most likely is the `Document` that has been created during parsing, or `undefined`.
 *   __**Warning: By configuring a faulty DOMHandler implementation,
 *   the specified behavior can completely be broken.**__
 *
 * @param {string} source Only string input is possible!
 * @param {string} [mimeType='application/xml']
 *        the mimeType or contentType of the document to be created
 *        determines the `type` of document created (XML or HTML)
 * @returns {Document | undefined}
 * @throws ParseError for specific errors depending on the configured `errorHandler`s and/or `domBuilder`
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
 * @see https://html.spec.whatwg.org/#dom-domparser-parsefromstring-dev
 */
DOMParser.prototype.parseFromString = function (source, mimeType) {
	var defaultNSMap = this.assign({}, this.xmlns)
	var entityMap = entities.XML_ENTITIES
	var defaultNamespace = defaultNSMap[''] || null
	if (MIME_TYPE.hasDefaultHTMLNamespace(mimeType)) {
		entityMap = entities.HTML_ENTITIES
		defaultNamespace = NAMESPACE.HTML
	} else if (mimeType === MIME_TYPE.XML_SVG_IMAGE) {
		defaultNamespace = NAMESPACE.SVG
	}
	defaultNSMap[''] = defaultNamespace
	defaultNSMap.xml = defaultNSMap.xml || NAMESPACE.XML

	var domBuilder = new this.domHandler({
			mimeType: mimeType,
			defaultNamespace: defaultNamespace,
		})
	var locator = this.locator ? {} : undefined;
	if (this.locator) {
		domBuilder.setDocumentLocator(locator)
	}

	var sax = new XMLReader()
	sax.errorHandler = buildErrorHandler(this.errorHandler, domBuilder, locator)
	sax.domBuilder = domBuilder
	if (source && typeof source === 'string') {
		sax.parse(this.normalizeLineEndings(source), defaultNSMap, entityMap)
	} else {
		sax.errorHandler.error('invalid doc source')
	}
	return domBuilder.doc
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

/**
 * @typedef DOMHandlerOptions
 * @property {string} [mimeType=MIME_TYPE.XML_APPLICATION]
 * @property {string|null} [defaultNamespace=null]
 */
/**
 * The class that is used to handle events from the SAX parser to create the related DOM elements.
 *
 * Some methods are only implemented as an empty function,
 * since they are (at least currently) not relevant for xmldom.
 *
 * @constructor
 * @param {DOMHandlerOptions} [options]
 * @see http://www.saxproject.org/apidoc/org/xml/sax/ext/DefaultHandler2.html
 */
function DOMHandler(options) {
	var opt = options || {}
	/**
	 * The mime type is used to determine if the DOM handler will create an XML or HTML document.
	 * Only if it is set to `text/html` it will create an HTML document.
	 * It defaults to MIME_TYPE.XML_APPLICATION.
	 *
	 * @type {string}
	 * @readonly
	 * @see MIME_TYPE
	 */
	this.mimeType = opt.mimeType || MIME_TYPE.XML_APPLICATION

	/**
	 * The namespace to use to create an XML document.
	 * For the following reasons this is required:
	 * - The SAX API for `startDocument` doesn't offer any way to pass a namespace,
	 *   since at that point there is no way for the parser to know what the default namespace from the document will be.
	 * - When creating using `DOMImplementation.createDocument` it is required to pass a namespace,
	 *   to determine the correct `Document.contentType`, which should match `this.mimeType`.
	 * - When parsing an XML document with the `application/xhtml+xml` mimeType,
	 *   the HTML namespace needs to be the default namespace.
	 *
	 * @type {string|null}
	 * @readonly
	 * @private
	 */
	this.defaultNamespace = opt.defaultNamespace || null

	/**
	 * @private
	 * @type {boolean}
	 */
	this.cdata = false


	/**
	 * The last `Element` that was created by `startElement`.
	 * `endElement` sets it to the `currentElement.parentNode`.
	 *
	 * Note: The sax parser currently sets it to white space text nodes between tags.
	 *
	 * @type {Element | Node | undefined}
	 * @private
	 */
	this.currentElement = undefined

	/**
	 * The Document that is created as part of `startDocument`,
	 * and returned by `DOMParser.parseFromString`.
	 *
	 * @type {Document | undefined}
	 * @readonly
	 */
	this.doc = undefined

	/**
	 * The locator is stored as part of setDocumentLocator.
	 * It is controlled and mutated by the SAX parser
	 * to store the current parsing position.
	 * It is used by DOMHandler to set `columnNumber` and `lineNumber`
	 * on the DOM nodes.
	 *
	 * @type {Readonly<Locator> | undefined}
	 * @readonly (the sax parser currently sometimes set's it)
	 * @private
	 */
	this.locator = undefined
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
DOMHandler.prototype = {
	/**
	 * Either creates an XML or an HTML document and stores it under `this.doc`.
	 * If it is an XML document, `this.defaultNamespace` is used to create it,
	 * and it will not contain any `childNodes`.
	 * If it is an HTML document, it will be created without any `childNodes`.
	 *
	 * @see  http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
	 */
	startDocument : function() {
		var impl = new DOMImplementation()
		this.doc = MIME_TYPE.isHTML(this.mimeType)
			? impl.createHTMLDocument(false)
			: impl.createDocument(this.defaultNamespace, '')
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;

		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	/**
	 * Stores the locator to be able to set the `columnNumber` and `lineNumber`
	 * on the created DOM nodes.
	 *
	 * @param {Locator} locator
	 */
	setDocumentLocator:function (locator) {
		if (locator) {
			locator.lineNumber = 0
		}
		this.locator = locator
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},

	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},

	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
					this.doc.doctype = dt;
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		throw new ParseError(error, this.locator);
	}
}
function _locator(l){
	if(l){
		return '\n@#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

exports.__DOMHandler = DOMHandler;
exports.normalizeLineEndings = normalizeLineEndings;
exports.DOMParser = DOMParser;
