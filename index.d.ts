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
	 * For both the `text/html` and the `application/xhtml+xml` namespace the spec defines that
	 * the HTML namespace is provided as the default.
	 *
	 * @param {string} mimeType
	 * @returns {boolean}
	 * @see https://dom.spec.whatwg.org/#dom-document-createelement
	 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument
	 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createhtmldocument
	 */
	function hasDefaultHTMLNamespace(
		mimeType: string
	): mimeType is typeof MIME_TYPE.HTML | typeof MIME_TYPE.XML_XHTML_APPLICATION;

	/**
	 * Only returns true if `value` matches MIME_TYPE.HTML, which indicates an HTML document.
	 *
	 * @see https://www.iana.org/assignments/media-types/text/html
	 * @see https://en.wikipedia.org/wiki/HTML
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
	 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
	 */
	function isHTMLMimeType(mimeType: string): mimeType is typeof MIME_TYPE.HTML;

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
	 *      WHATWG HTML Spec
	 * @see {@link DOMParser.prototype.parseFromString}
	 */
	type MIME_TYPE = (typeof MIME_TYPE)[keyof typeof MIME_TYPE];
	/**
	 * All mime types that are allowed as input to `DOMParser.parseFromString`
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#Argument02
	 *      MDN
	 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#domparsersupportedtype
	 *      WHATWG HTML Spec
	 * @see {@link DOMParser.prototype.parseFromString}
	 */
	var MIME_TYPE: {
		/**
		 * `text/html`, the only mime type that triggers treating an XML document as HTML.
		 *
		 * @see https://www.iana.org/assignments/media-types/text/html IANA MimeType registration
		 * @see https://en.wikipedia.org/wiki/HTML Wikipedia
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString MDN
		 * @see https://html.spec.whatwg.org/multipage/dynamic-markup-insertion.html#dom-domparser-parsefromstring
		 *      WHATWG HTML Spec
		 */
		readonly HTML: 'text/html';
		/**
		 * `application/xml`, the standard mime type for XML documents.
		 *
		 * @see https://www.iana.org/assignments/media-types/application/xml IANA MimeType
		 *      registration
		 * @see https://tools.ietf.org/html/rfc7303#section-9.1 RFC 7303
		 * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
		 */
		readonly XML_APPLICATION: 'application/xml';
		/**
		 * `text/html`, an alias for `application/xml`.
		 *
		 * @see https://tools.ietf.org/html/rfc7303#section-9.2 RFC 7303
		 * @see https://www.iana.org/assignments/media-types/text/xml IANA MimeType registration
		 * @see https://en.wikipedia.org/wiki/XML_and_MIME Wikipedia
		 */
		readonly XML_TEXT: 'text/xml';
		/**
		 * `application/xhtml+xml`, indicates an XML document that has the default HTML namespace,
		 * but is parsed as an XML document.
		 *
		 * @see https://www.iana.org/assignments/media-types/application/xhtml+xml IANA MimeType
		 *      registration
		 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument WHATWG DOM Spec
		 * @see https://en.wikipedia.org/wiki/XHTML Wikipedia
		 */
		readonly XML_XHTML_APPLICATION: 'application/xhtml+xml';
		/**
		 * `image/svg+xml`,
		 *
		 * @see https://www.iana.org/assignments/media-types/image/svg+xml IANA MimeType registration
		 * @see https://www.w3.org/TR/SVG11/ W3C SVG 1.1
		 * @see https://en.wikipedia.org/wiki/Scalable_Vector_Graphics Wikipedia
		 */
		readonly XML_SVG_IMAGE: 'image/svg+xml';
	};
	/**
	 * Namespaces that are used in xmldom.
	 *
	 * @see http://www.w3.org/TR/REC-xml-names
	 */
	type NAMESPACE = (typeof NAMESPACE)[keyof typeof NAMESPACE];
	/**
	 * Namespaces that are used in xmldom.
	 *
	 * @see http://www.w3.org/TR/REC-xml-names
	 */
	var NAMESPACE: {
		/**
		 * The XHTML namespace.
		 *
		 * @see http://www.w3.org/1999/xhtml
		 */
		readonly HTML: 'http://www.w3.org/1999/xhtml';
		/**
		 * The SVG namespace.
		 *
		 * @see http://www.w3.org/2000/svg
		 */
		readonly SVG: 'http://www.w3.org/2000/svg';
		/**
		 * The `xml:` namespace.
		 *
		 * @see http://www.w3.org/XML/1998/namespace
		 */
		readonly XML: 'http://www.w3.org/XML/1998/namespace';

		/**
		 * The `xmlns:` namespace.
		 *
		 * @see https://www.w3.org/2000/xmlns/
		 */
		readonly XMLNS: 'http://www.w3.org/2000/xmlns/';
	};

	// END ./lib/conventions.js

	// START ./lib/errors.js
	type DOMExceptionName =
		(typeof DOMExceptionName)[keyof typeof DOMExceptionName];
	var DOMExceptionName: {
		/**
		 * the default value as defined by the spec
		 */
		readonly Error: 'Error';
		/**
		 * @deprecated
		 * Use RangeError instead.
		 */
		readonly IndexSizeError: 'IndexSizeError';
		/**
		 * @deprecated
		 * Just to match the related static code, not part of the spec.
		 */
		readonly DomstringSizeError: 'DomstringSizeError';
		readonly HierarchyRequestError: 'HierarchyRequestError';
		readonly WrongDocumentError: 'WrongDocumentError';
		readonly InvalidCharacterError: 'InvalidCharacterError';
		/**
		 * @deprecated
		 * Just to match the related static code, not part of the spec.
		 */
		readonly NoDataAllowedError: 'NoDataAllowedError';
		readonly NoModificationAllowedError: 'NoModificationAllowedError';
		readonly NotFoundError: 'NotFoundError';
		readonly NotSupportedError: 'NotSupportedError';
		readonly InUseAttributeError: 'InUseAttributeError';
		readonly InvalidStateError: 'InvalidStateError';
		readonly SyntaxError: 'SyntaxError';
		readonly InvalidModificationError: 'InvalidModificationError';
		readonly NamespaceError: 'NamespaceError';
		/**
		 * @deprecated
		 * Use TypeError for invalid arguments,
		 * "NotSupportedError" DOMException for unsupported operations,
		 * and "NotAllowedError" DOMException for denied requests instead.
		 */
		readonly InvalidAccessError: 'InvalidAccessError';
		/**
		 * @deprecated
		 * Just to match the related static code, not part of the spec.
		 */
		readonly ValidationError: 'ValidationError';
		/**
		 * @deprecated
		 * Use TypeError instead.
		 */
		readonly TypeMismatchError: 'TypeMismatchError';
		readonly SecurityError: 'SecurityError';
		readonly NetworkError: 'NetworkError';
		readonly AbortError: 'AbortError';
		/**
		 * @deprecated
		 * Just to match the related static code, not part of the spec.
		 */
		readonly URLMismatchError: 'URLMismatchError';
		readonly QuotaExceededError: 'QuotaExceededError';
		readonly TimeoutError: 'TimeoutError';
		readonly InvalidNodeTypeError: 'InvalidNodeTypeError';
		readonly DataCloneError: 'DataCloneError';
		readonly EncodingError: 'EncodingError';
		readonly NotReadableError: 'NotReadableError';
		readonly UnknownError: 'UnknownError';
		readonly ConstraintError: 'ConstraintError';
		readonly DataError: 'DataError';
		readonly TransactionInactiveError: 'TransactionInactiveError';
		readonly ReadOnlyError: 'ReadOnlyError';
		readonly VersionError: 'VersionError';
		readonly OperationError: 'OperationError';
		readonly NotAllowedError: 'NotAllowedError';
		readonly OptOutError: 'OptOutError';
	};
	type ExceptionCode = (typeof ExceptionCode)[keyof typeof ExceptionCode];

	var ExceptionCode: {
		readonly INDEX_SIZE_ERR: 1;
		readonly DOMSTRING_SIZE_ERR: 2;
		readonly HIERARCHY_REQUEST_ERR: 3;
		readonly WRONG_DOCUMENT_ERR: 4;
		readonly INVALID_CHARACTER_ERR: 5;
		readonly NO_DATA_ALLOWED_ERR: 6;
		readonly NO_MODIFICATION_ALLOWED_ERR: 7;
		readonly NOT_FOUND_ERR: 8;
		readonly NOT_SUPPORTED_ERR: 9;
		readonly INUSE_ATTRIBUTE_ERR: 10;
		readonly INVALID_STATE_ERR: 11;
		readonly SYNTAX_ERR: 12;
		readonly INVALID_MODIFICATION_ERR: 13;
		readonly NAMESPACE_ERR: 14;
		readonly INVALID_ACCESS_ERR: 15;
		readonly VALIDATION_ERR: 16;
		readonly TYPE_MISMATCH_ERR: 17;
		readonly SECURITY_ERR: 18;
		readonly NETWORK_ERR: 19;
		readonly ABORT_ERR: 20;
		readonly URL_MISMATCH_ERR: 21;
		readonly QUOTA_EXCEEDED_ERR: 22;
		readonly TIMEOUT_ERR: 23;
		readonly INVALID_NODE_TYPE_ERR: 24;
		readonly DATA_CLONE_ERR: 25;
	};

	/**
	 * DOM operations only raise exceptions in "exceptional" circumstances, i.e., when an
	 * operation is impossible to perform (either for logical reasons, because data is lost, or
	 * because the implementation has become unstable). In general, DOM methods return specific
	 * error values in ordinary processing situations, such as out-of-bound errors when using
	 * NodeList.
	 *
	 * Implementations should raise other exceptions under other circumstances. For example,
	 * implementations should raise an implementation-dependent exception if a null argument is
	 * passed when null was not expected.
	 *
	 * This implementation supports the following usages:
	 * 1. according to the living standard (both arguments are optional):
	 * ```
	 * new DOMException("message (can be empty)", DOMExceptionNames.HierarchyRequestError)
	 * ```
	 * 2. according to previous xmldom implementation (only the first argument is required):
	 * ```
	 * new DOMException(DOMException.HIERARCHY_REQUEST_ERR, "optional message")
	 * ```
	 * both result in the proper name being set.
	 *
	 * @see https://webidl.spec.whatwg.org/#idl-DOMException
	 * @see https://webidl.spec.whatwg.org/#dfn-error-names-table
	 * @see https://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-17189187
	 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
	 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
	 */
	class DOMException extends Error {
		constructor(message?: string, name?: DOMExceptionName | string);
		constructor(code?: ExceptionCode, message?: string);

		readonly name: DOMExceptionName;
		readonly code: ExceptionCode | 0;
		static readonly INDEX_SIZE_ERR: 1;
		static readonly DOMSTRING_SIZE_ERR: 2;
		static readonly HIERARCHY_REQUEST_ERR: 3;
		static readonly WRONG_DOCUMENT_ERR: 4;
		static readonly INVALID_CHARACTER_ERR: 5;
		static readonly NO_DATA_ALLOWED_ERR: 6;
		static readonly NO_MODIFICATION_ALLOWED_ERR: 7;
		static readonly NOT_FOUND_ERR: 8;
		static readonly NOT_SUPPORTED_ERR: 9;
		static readonly INUSE_ATTRIBUTE_ERR: 10;
		static readonly INVALID_STATE_ERR: 11;
		static readonly SYNTAX_ERR: 12;
		static readonly INVALID_MODIFICATION_ERR: 13;
		static readonly NAMESPACE_ERR: 14;
		static readonly INVALID_ACCESS_ERR: 15;
		static readonly VALIDATION_ERR: 16;
		static readonly TYPE_MISMATCH_ERR: 17;
		static readonly SECURITY_ERR: 18;
		static readonly NETWORK_ERR: 19;
		static readonly ABORT_ERR: 20;
		static readonly URL_MISMATCH_ERR: 21;
		static readonly QUOTA_EXCEEDED_ERR: 22;
		static readonly TIMEOUT_ERR: 23;
		static readonly INVALID_NODE_TYPE_ERR: 24;
		static readonly DATA_CLONE_ERR: 25;
	}

	/**
	 * Creates an error that will not be caught by XMLReader aka the SAX parser.
	 */
	class ParseError extends Error {
		constructor(message: string, locator?: any, cause?: Error);

		readonly message: string;
		readonly locator?: any;
	}

	// END ./lib/errors.js

	// START ./lib/dom.js
	/**
	 * The DOM Node interface is an abstract base class upon which many other DOM API objects are
	 * based, thus letting those object types to be used similarly and often interchangeably. As an
	 * abstract class, there is no such thing as a plain Node object. All objects that implement
	 * Node functionality are based on one of its subclasses. Most notable are Document, Element,
	 * and DocumentFragment.
	 *
	 * In addition, every kind of DOM node is represented by an interface based on Node. These
	 * include Attr, CharacterData (which Text, Comment, CDATASection and ProcessingInstruction are
	 * all based on), and DocumentType.
	 *
	 * In some cases, a particular feature of the base Node interface may not apply to one of its
	 * child interfaces; in that case, the inheriting node may return null or throw an exception,
	 * depending on circumstances. For example, attempting to add children to a node type that
	 * cannot have children will throw an exception.
	 *
	 * **This behavior is slightly different from the in the specs**:
	 * - undeclared properties: nodeType, baseURI, isConnected, parentElement, textContent
	 * - missing methods: contains, getRootNode, isEqualNode, isSameNode
	 *
	 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
	 * @see https://dom.spec.whatwg.org/#node
	 * @prettierignore
	 */
	interface Node {
		/**
		 * Returns the children.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/childNodes)
		 */
		readonly childNodes: NodeList;
		/**
		 * Returns the first child.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/firstChild)
		 */
		readonly firstChild: Node | null;
		/**
		 * Returns the last child.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lastChild)
		 */
		readonly lastChild: Node | null;
		/**
		 * The local part of the qualified name of this node.
		 */
		localName: string | null;
		/**
		 * The namespace URI of this node.
		 */
		readonly namespaceURI: string | null;
		/**
		 * Returns the next sibling.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nextSibling)
		 */
		readonly nextSibling: Node | null;
		/**
		 * Returns a string appropriate for the type of node.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeName)
		 */
		readonly nodeName: string;
		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeValue) */
		nodeValue: string | null;
		/**
		 * Returns the node document. Returns null for documents.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/ownerDocument)
		 */
		readonly ownerDocument: Document | null;
		/**
		 * Returns the parent.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentNode)
		 */
		readonly parentNode: ParentNode | null;
		/**
		 * The prefix of the namespace for this node.
		 */
		prefix: string | null;
		/**
		 * Returns the previous sibling.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/previousSibling)
		 */
		readonly previousSibling: Node | null;

		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/appendChild) */
		appendChild(node: Node): Node;

		/**
		 * Returns a copy of node. If deep is true, the copy also includes the node's descendants.
		 *
		 * @throws {DOMException}
		 * May throw a DOMException if operations within {@link Element#setAttributeNode} or
		 * {@link Node#appendChild} (which are potentially invoked in this method) do not meet their
		 * specific constraints.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/cloneNode)
		 */
		cloneNode(deep?: boolean): Node;

		/**
		 * Returns a bitmask indicating the position of other relative to node.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/compareDocumentPosition)
		 */
		compareDocumentPosition(other: Node): number;

		/**
		 * Returns whether node has children.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/hasChildNodes)
		 */
		hasChildNodes(): boolean;

		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/insertBefore) */
		insertBefore(node: Node, child: Node | null): Node;

		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/isDefaultNamespace) */
		isDefaultNamespace(namespace: string | null): boolean;

		/**
		 * Checks whether the DOM implementation implements a specific feature and its version.
		 *
		 * @deprecated
		 * Since `DOMImplementation.hasFeature` is deprecated and always returns true.
		 * @param feature
		 * The package name of the feature to test. This is the same name that can be passed to the
		 * method `hasFeature` on `DOMImplementation`.
		 * @param version
		 * This is the version number of the package name to test.
		 * @since Introduced in DOM Level 2
		 * @see {@link DOMImplementation.hasFeature}
		 */
		isSupported(feature: string, version: string): true;

		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lookupNamespaceURI) */
		lookupNamespaceURI(prefix: string | null): string | null;

		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lookupPrefix) */
		lookupPrefix(namespace: string | null): string | null;

		/**
		 * Removes empty exclusive Text nodes and concatenates the data of remaining contiguous
		 * exclusive Text nodes into the first of their nodes.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/normalize)
		 */
		normalize(): void;

		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/removeChild) */
		removeChild(child: Node): Node;

		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/replaceChild) */
		replaceChild(node: Node, child: Node): Node;

		/** node is an element. */
		readonly ELEMENT_NODE: 1;
		readonly ATTRIBUTE_NODE: 2;
		/** node is a Text node. */
		readonly TEXT_NODE: 3;
		/** node is a CDATASection node. */
		readonly CDATA_SECTION_NODE: 4;
		readonly ENTITY_REFERENCE_NODE: 5;
		readonly ENTITY_NODE: 6;
		/** node is a ProcessingInstruction node. */
		readonly PROCESSING_INSTRUCTION_NODE: 7;
		/** node is a Comment node. */
		readonly COMMENT_NODE: 8;
		/** node is a document. */
		readonly DOCUMENT_NODE: 9;
		/** node is a doctype. */
		readonly DOCUMENT_TYPE_NODE: 10;
		/** node is a DocumentFragment node. */
		readonly DOCUMENT_FRAGMENT_NODE: 11;
		readonly NOTATION_NODE: 12;
		/** Set when node and other are not in the same tree. */
		readonly DOCUMENT_POSITION_DISCONNECTED: 0x01;
		/** Set when other is preceding node. */
		readonly DOCUMENT_POSITION_PRECEDING: 0x02;
		/** Set when other is following node. */
		readonly DOCUMENT_POSITION_FOLLOWING: 0x04;
		/** Set when other is an ancestor of node. */
		readonly DOCUMENT_POSITION_CONTAINS: 0x08;
		/** Set when other is a descendant of node. */
		readonly DOCUMENT_POSITION_CONTAINED_BY: 0x10;
		readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 0x20;
	}

	var Node: {
		// instanceof pre ts 5.3
		(val: unknown): val is Node;
		// instanceof post ts 5.3
		[Symbol.hasInstance](val: unknown): val is Node;
		/** node is an element. */
		readonly ELEMENT_NODE: 1;
		readonly ATTRIBUTE_NODE: 2;
		/** node is a Text node. */
		readonly TEXT_NODE: 3;
		/** node is a CDATASection node. */
		readonly CDATA_SECTION_NODE: 4;
		readonly ENTITY_REFERENCE_NODE: 5;
		readonly ENTITY_NODE: 6;
		/** node is a ProcessingInstruction node. */
		readonly PROCESSING_INSTRUCTION_NODE: 7;
		/** node is a Comment node. */
		readonly COMMENT_NODE: 8;
		/** node is a document. */
		readonly DOCUMENT_NODE: 9;
		/** node is a doctype. */
		readonly DOCUMENT_TYPE_NODE: 10;
		/** node is a DocumentFragment node. */
		readonly DOCUMENT_FRAGMENT_NODE: 11;
		readonly NOTATION_NODE: 12;
		/** Set when node and other are not in the same tree. */
		readonly DOCUMENT_POSITION_DISCONNECTED: 0x01;
		/** Set when other is preceding node. */
		readonly DOCUMENT_POSITION_PRECEDING: 0x02;
		/** Set when other is following node. */
		readonly DOCUMENT_POSITION_FOLLOWING: 0x04;
		/** Set when other is an ancestor of node. */
		readonly DOCUMENT_POSITION_CONTAINS: 0x08;
		/** Set when other is a descendant of node. */
		readonly DOCUMENT_POSITION_CONTAINED_BY: 0x10;
		readonly DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 0x20;
	};

	/**
	 * NodeList objects are collections of nodes, usually returned by properties such as
	 * Node.childNodes and methods such as document.querySelectorAll().
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/NodeList)
	 */
	class NodeList implements Iterable<Node> {
		/**
		 * Returns the number of nodes in the collection.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/NodeList/length)
		 */
		readonly length: number;
		/**
		 * Returns the node with index index from the collection. The nodes are sorted in tree order.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/NodeList/item)
		 */
		item(index: number): Node | null;
		/**
		 * Returns a string representation of the NodeList.
		 */
		toString(nodeFilter: (node: Node) => Node | undefined): string;
		/**
		 * Filters the NodeList based on a predicate.
		 *
		 * @private
		 */
		filter(predicate: (node: Node) => boolean): Node[];
		/**
		 * Returns the first index at which a given node can be found in the NodeList, or -1 if it is
		 * not present.
		 *
		 * @private
		 */
		indexOf(node: Node): number;
		[index: number]: Node | undefined;

		[Symbol.iterator](): Iterator<Node>;
	}

	/**
	 * Represents a live collection of nodes that is automatically updated when its associated
	 * document changes.
	 */
	interface LiveNodeList extends NodeList {}
	/**
	 * Represents a live collection of nodes that is automatically updated when its associated
	 * document changes.
	 */
	var LiveNodeList: {
		// instanceof pre ts 5.3
		(val: unknown): val is LiveNodeList;
		// instanceof post ts 5.3
		[Symbol.hasInstance](val: unknown): val is LiveNodeList;
	};

	interface Document extends Node {
		/**
		 * The mime type of the document is determined at creation time and can not be modified.
		 *
		 * @see https://dom.spec.whatwg.org/#concept-document-content-type
		 * @see {@link DOMImplementation}
		 * @see {@link MIME_TYPE}
		 */
		readonly contentType: MIME_TYPE;
		/**
		 * @see https://dom.spec.whatwg.org/#concept-document-type
		 * @see {@link DOMImplementation}
		 */
		readonly type: 'html' | 'xml';
		/**
		 * The implementation that created this document.
		 *
		 * @type DOMImplementation
		 * @readonly
		 */
		readonly implementation: DOMImplementation;
		readonly ownerDocument: Document;
		readonly nodeName: '#document';
		readonly nodeType: typeof Node.DOCUMENT_NODE;
		readonly doctype: DocumentType | null;

		/**
		 * Creates an attribute object with a specified name.
		 *
		 * @param name
		 * String that sets the attribute object's name.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createAttribute)
		 */
		createAttribute(localName: string): Attr;

		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createAttributeNS) */
		createAttributeNS(namespace: string | null, qualifiedName: string): Attr;

		/**
		 * Returns a CDATASection node whose data is data.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createCDATASection)
		 */
		createCDATASection(data: string): CDATASection;

		/**
		 * Creates a comment object with the specified data.
		 *
		 * @param data
		 * Sets the comment object's data.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createComment)
		 */
		createComment(data: string): Comment;

		/**
		 * Creates a new document.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createDocumentFragment)
		 */
		createDocumentFragment(): DocumentFragment;

		/**
		 * Creates an instance of the element for the specified tag.
		 *
		 * @param tagName
		 * The name of an element.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createElement)
		 */
		createElement<K extends keyof HTMLElementTagNameMap>(
			tagName: K,
			options?: ElementCreationOptions
		): HTMLElementTagNameMap[K];

		/**
		 * @deprecated
		 */
		createElement<K extends keyof HTMLElementDeprecatedTagNameMap>(
			tagName: K,
			options?: ElementCreationOptions
		): HTMLElementDeprecatedTagNameMap[K];

		createElement(
			tagName: string,
			options?: ElementCreationOptions
		): HTMLElement;

		/**
		 * Returns an element with namespace namespace. Its namespace prefix will be everything before
		 * ":" (U+003E) in qualifiedName or null. Its local name will be everything after ":" (U+003E)
		 * in qualifiedName or qualifiedName.
		 *
		 * If localName does not match the Name production an "InvalidCharacterError" DOMException will
		 * be thrown.
		 *
		 * If one of the following conditions is true a "NamespaceError" DOMException will be thrown:
		 *
		 * localName does not match the QName production.
		 * Namespace prefix is not null and namespace is the empty string.
		 * Namespace prefix is "xml" and namespace is not the XML namespace.
		 * qualifiedName or namespace prefix is "xmlns" and namespace is not the XMLNS namespace.
		 * namespace is the XMLNS namespace and neither qualifiedName nor namespace prefix is "xmlns".
		 *
		 * When supplied, options's is can be used to create a customized built-in element.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createElementNS)
		 */
		createElementNS(
			namespaceURI: 'http://www.w3.org/1999/xhtml',
			qualifiedName: string
		): HTMLElement;

		createElementNS<K extends keyof SVGElementTagNameMap>(
			namespaceURI: 'http://www.w3.org/2000/svg',
			qualifiedName: K
		): SVGElementTagNameMap[K];

		createElementNS(
			namespaceURI: 'http://www.w3.org/2000/svg',
			qualifiedName: string
		): SVGElement;

		createElementNS<K extends keyof MathMLElementTagNameMap>(
			namespaceURI: 'http://www.w3.org/1998/Math/MathML',
			qualifiedName: K
		): MathMLElementTagNameMap[K];

		createElementNS(
			namespaceURI: 'http://www.w3.org/1998/Math/MathML',
			qualifiedName: string
		): MathMLElement;

		createElementNS(
			namespaceURI: string | null,
			qualifiedName: string,
			options?: ElementCreationOptions
		): Element;

		createElementNS(
			namespace: string | null,
			qualifiedName: string,
			options?: string | ElementCreationOptions
		): Element;

		/**
		 * Returns a ProcessingInstruction node whose target is target and data is data. If target does
		 * not match the Name production an "InvalidCharacterError" DOMException will be thrown. If
		 * data contains "?>" an "InvalidCharacterError" DOMException will be thrown.
		 *
		 * [MDN
		 * Reference](https://developer.mozilla.org/docs/Web/API/Document/createProcessingInstruction)
		 */
		createProcessingInstruction(
			target: string,
			data: string
		): ProcessingInstruction;

		/**
		 * Creates a text string from the specified value.
		 *
		 * @param data
		 * String that specifies the nodeValue property of the text node.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/createTextNode)
		 */
		createTextNode(data: string): Text;

		/**
		 * Returns a reference to the first object with the specified value of the ID attribute.
		 *
		 * @param elementId
		 * String that specifies the ID value.
		 */
		getElementById(elementId: string): HTMLElement | null;

		/**
		 * The `getElementsByClassName` method of `Document` interface returns an array-like object
		 * of all child elements which have **all** of the given class name(s).
		 *
		 * Returns an empty list if `classeNames` is an empty string or only contains HTML white
		 * space characters.
		 *
		 * Warning: This is a live LiveNodeList.
		 * Changes in the DOM will reflect in the array as the changes occur.
		 * If an element selected by this array no longer qualifies for the selector,
		 * it will automatically be removed. Be aware of this for iteration purposes.
		 *
		 * @param {string} classNames
		 * Is a string representing the class name(s) to match; multiple class names are separated by
		 * (ASCII-)whitespace.
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName
		 * @see https://dom.spec.whatwg.org/#concept-getelementsbyclassname
		 */
		getElementsByClassName(classNames: string): LiveNodeList;

		/**
		 * Returns a copy of node. If deep is true, the copy also includes the node's descendants.
		 *
		 * If node is a document or a shadow root, throws a "NotSupportedError" DOMException.
		 *
		 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/importNode)
		 */
		importNode<T extends Node>(node: T, deep?: boolean): T;
	}

	var Document: {
		// instanceof pre ts 5.3
		(val: unknown): val is Document;
		// instanceof post ts 5.3
		[Symbol.hasInstance](val: unknown): val is Document;
	};

	/**
	 * A Node containing a doctype.
	 *
	 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DocumentType)
	 */
	interface DocumentType extends Node {
		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DocumentType/name) */
		readonly name: string;
		readonly internalSubset: string;
		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DocumentType/publicId) */
		readonly publicId: string;
		/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/DocumentType/systemId) */
		readonly systemId: string;
	}

	var DocumentType: {
		// instanceof pre ts 5.3
		(val: unknown): val is DocumentType;
		// instanceof post ts 5.3
		[Symbol.hasInstance](val: unknown): val is DocumentType;
	};

	class DOMImplementation {
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
		constructor();

		/**
		 * Creates an XML Document object of the specified type with its document element.
		 *
		 * __It behaves slightly different from the description in the living standard__:
		 * - There is no interface/class `XMLDocument`, it returns a `Document` instance (with it's
		 * `type` set to `'xml'`).
		 * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
		 *
		 * @returns {Document}
		 * The XML document.
		 * @see {@link DOMImplementation.createHTMLDocument}
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation/createDocument MDN
		 * @see https://www.w3.org/TR/DOM-Level-2-Core/core.html#Level-2-Core-DOM-createDocument DOM
		 *      Level 2 Core (initial)
		 * @see https://dom.spec.whatwg.org/#dom-domimplementation-createdocument DOM Level 2 Core
		 */
		createDocument(
			namespaceURI: NAMESPACE | string | null,
			qualifiedName: string,
			doctype?: DocumentType | null
		): Document;

		/**
		 * Returns a doctype, with the given `qualifiedName`, `publicId`, and `systemId`.
		 *
		 * __This behavior is slightly different from the in the specs__:
		 * - `encoding`, `mode`, `origin`, `url` fields are currently not declared.
		 *
		 * @returns {DocumentType}
		 * which can either be used with `DOMImplementation.createDocument`
		 * upon document creation or can be put into the document via methods like
		 * `Node.insertBefore()` or `Node.replaceChild()`
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
		 * - several properties and methods are missing - Nothing related to events is implemented.
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

	class XMLSerializer {
		serializeToString(node: Node, nodeFilter?: (node: Node) => boolean): string;
	}

	// END ./lib/dom.js

	// START ./lib/dom-parser.js
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
	class DOMParser {
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
		constructor(options?: DOMParserOptions);

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
		 * @returns
		 * The `Document` node.
		 * @throws {ParseError}
		 * for any `fatalError` or anything that is thrown by `onError`
		 * @throws {TypeError}
		 * for any invalid `mimeType`
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
		 * @see https://html.spec.whatwg.org/#dom-domparser-parsefromstring-dev
		 */
		parseFromString(source: string, mimeType: MIME_TYPE | string): Document;
	}

	interface DOMParserOptions {
		/**
		 * The method to use instead of `Object.assign` (defaults to `conventions.assign`),
		 * which is used to copy values from the options before they are used for parsing.
		 *
		 * @private
		 * @see {@link assign}
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
		 * @throws {TypeError}
		 * If it is an object.
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
