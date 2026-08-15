'use strict';
const fs = require('fs');
const path = require('path');

const skippedInHtml = true;
/**
 * @typedef ErrorReport
 * @property {string} source
 * The XML snippet.
 * @property {'error' | 'warning' | 'fatalError'} level
 * The name of the method triggered.
 * @property {function(msg:string):boolean} [match]
 * To pick the relevant report when there are multiple.
 * @property {boolean} [skippedInHtml]
 * Is the error reported when parsing HTML?
 */
/**
 * A collection of XML samples and related information that cause the XMLReader
 * to call methods on `errorHandler`.
 */
const REPORTED = {
	/**
	 * There are well-formed documents containing the unicode replacement character,
	 * e.g. https://en.wikipedia.org/wiki/Mojibake
	 * see https://github.com/xmldom/xmldom/issues/790#issuecomment-2493975063
	 * But reading files in a different encoding than they have been written with,
	 * will also lead to these characters being present.
	 * Which is why this is reported once at the beginning,
	 * before parsing any content.
	 * Use `onWarningStopParsing` to prevent parsing documents containing these characters.
	 */
	Encoding_ReplacementCharacter: {
		source: '<doc>\ufffd</doc>',
		level: 'warning',
		match: (msg) => /unicode replacement character/i.test(msg),
	},
	/**
	 * Well-formedness constraint: Element Type Match
	 *
	 * The Name in an element's end-tag must match the element type in the start-tag.
	 *
	 * @see https://www.w3.org/TR/xml/#GIMatch
	 * @see https://www.w3.org/TR/xml11/#GIMatch
	 */
	WF_ElementTypeMatch_QName: {
		source: '<xml><a></b></xml 1',
		level: 'fatalError',
		match: (msg) => /end tag name contains invalid characters/.test(msg),
	},
	WF_ElementTypeMatch_QName_complex: {
		source: '<r><Page><Label /></Page  <Page></Page></r>',
		level: 'fatalError',
		match: (msg) => /end tag name contains invalid characters/.test(msg),
	},
	/**
	 * Well-formedness constraint: Element Type Match
	 *
	 * The Name in an element's end-tag must match the element type in the start-tag.
	 *
	 * @see https://www.w3.org/TR/xml/#GIMatch
	 * @see https://www.w3.org/TR/xml11/#GIMatch
	 */
	WF_ElementTypeMatch_Mismatch: {
		source: '<xml><a></b></xml>',
		level: 'fatalError',
		match: (msg) => /Opening and ending tag mismatch/.test(msg),
	},
	WF_ElementTypeMatch_Mismatch_Root: {
		source: '<xml></Xml>',
		level: 'fatalError',
		skippedInHtml,
		match: (msg) => /Opening and ending tag mismatch/.test(msg),
	},
	WF_ElementTypeMatch_Mismatch_Root_UnclosedMultiple: {
		source: '<xml></xml <second></second>',
		level: 'fatalError',
		match: (msg) => /Opening and ending tag mismatch/.test(msg),
	},
	/**
	 * In the Browser (for XML) this is reported as
	 * `error on line 1 at column 6: Extra content at the end of the document`
	 * for HTML it's added to the DOM without anything being reported.
	 */
	WF_ElementTypeMatch_UnclosedXmlTag: {
		source: '<xml>',
		level: 'fatalError',
		skippedInHtml,
		match: (msg) => /unclosed xml tag\(s\)/.test(msg),
	},
	WF_ElementTypeMatch_EndTagMissingName: {
		source: '<xml></>',
		level: 'fatalError',
		match: (msg) => /end tag name missing/.test(msg),
	},
	/**
	 * This sample doesn't follow the specified grammar.
	 * In the browser it is reported as `error on line 1 at column 5: Couldn't find end of Start Tag xml`.
	 */
	WF_ElementTypeMatch_UnclosedXmlTag_IncompleteStartTag: {
		source: '<xml',
		level: 'fatalError',
		skippedInHtml,
		match: (msg) => /unclosed xml tag\(s\)/.test(msg),
	},
	/**
	 * Entities need to be in the entityMap to be converted as part of parsing.
	 * xmldom currently doesn't parse entities declared in DTD.
	 *
	 * @see https://www.w3.org/TR/xml/#wf-entdeclared
	 * @see https://www.w3.org/TR/xml11/#wf-entdeclared
	 */
	WF_EntityDeclared: {
		source: '<xml>&e;</xml>',
		level: 'error',
		match: (msg) => /entity not found/.test(msg),
	},
	WF_EntityDeclared_Attr: {
		source: '<xml attr="&e;"></xml>',
		level: 'error',
		match: (msg) => /entity not found/.test(msg),
	},
	WF_EntityDeclared_Script: {
		source: '<script>&e;</script>',
		level: 'error',
		skippedInHtml,
		match: (msg) => /entity not found/.test(msg),
	},
	WF_EntityRef: {
		source: '<xml>&amp</xml>',
		level: 'error',
		skippedInHtml,
		match: (msg) => /EntityRef: expecting ;/.test(msg),
	},
	WF_EntityRef_Attr: {
		source: '<xml attr="&amp"></xml>',
		level: 'error',
		skippedInHtml,
		match: (msg) => /EntityRef: expecting ;/.test(msg),
	},
	WF_EntityRef_Script: {
		source: '<script>&amp</script>',
		level: 'error',
		skippedInHtml,
		match: (msg) => /EntityRef: expecting ;/.test(msg),
	},
	WF_Entity_ReferenceProduction: {
		source: '<xml>&1;</xml>',
		level: 'error',
		match: (msg) => /entity not matching Reference production/.test(msg),
	},
	WF_Entity_ReferenceProduction_Attr: {
		source: '<xml attr="&1;"></xml>',
		level: 'error',
		match: (msg) => /entity not matching Reference production/.test(msg),
	},
	WF_Entity_ReferenceProduction_Script: {
		source: '<script>&1;</script>',
		level: 'error',
		skippedInHtml,
		match: (msg) => /entity not matching Reference production/.test(msg),
	},
	/**
	 * Well-formedness constraint: Unique Att Spec
	 *
	 * An attribute name must not appear more than once in the same start-tag or empty-element
	 * tag.
	 *
	 * In the browser:
	 * - as XML it is reported as `error on line 1 at column 17: Attribute a redefined`
	 * - as HTML only the first definition is considered
	 *
	 * In xmldom the behavior is different for namespaces (picks first)
	 * than for other attributes (picks last),
	 * which can be a security issue.
	 *
	 * @see https://www.w3.org/TR/xml/#uniqattspec
	 * @see https://www.w3.org/TR/xml11/#uniqattspec
	 */
	WF_DuplicateAttribute: {
		source: '<xml a="1" a="2"></xml>',
		level: 'fatalError',
		match: (msg) => /Attribute .* redefined/.test(msg),
	},
	/**
	 * Well-formedness constraint: No < in Attribute Values
	 *
	 * The replacement text of any entity referred to directly or indirectly in an attribute value
	 * must not contain a `<`.
	 *
	 * @see https://www.w3.org/TR/xml/#CleanAttrVals
	 * @see https://www.w3.org/TR/xml11/#CleanAttrVals
	 */
	WF_AttValue_CleanAttrVals: {
		source: '<xml attr="1<2">',
		level: 'fatalError',
		skippedInHtml,
		match: (msg) => /Unescaped '<' not allowed in attributes values/.test(msg),
	},
	WF_AttValue_CleanAttrVals_MissingClosingQuote: {
		source: '<xml><Label onClick="doClick..>Hello, World</Label></xml>',
		level: 'fatalError',
		// the sample still reports another fatalError, because `Label` is never properly closed.
		// (search for the key in the snapshots to see it)
		// our test just makes sure that this specific error is not reported
		// browsers ignore the faulty tag, but this is not easy to implement
		skippedInHtml,
		match: (msg) => /Unescaped '<' not allowed in attributes values/.test(msg),
	},
	/**
	 * This sample doesn't follow the specified grammar.
	 * In the browser it is reported as `error on line 1 at column 6: Comment not terminated`.
	 */
	SYNTAX_UnclosedComment: {
		source: '<xml></xml><!--',
		level: 'fatalError',
		match: (msg) => /comment is not well-formed/.test(msg),
	},
	/**
	 * Triggered by lib/sax.js:596, caught in 208
	 * This sample doesn't follow the specified grammar.
	 * In the browser:
	 * - as XML it is reported as
	 * `error on line 1 at column 2: StartTag: invalid element name`
	 * - as HTML it is accepted as characters
	 *
	 */
	SYNTAX_InvalidTagName: {
		source: '<xml><123 /></xml>',
		level: 'error',
		match: (msg) => /invalid tagName/.test(msg),
	},
	/**
	 * Triggered by lib/sax.js:602, caught in 208
	 * This sample doesn't follow the specified grammar.
	 * In the browser:
	 * - as XML it is reported as
	 * `error on line 1 at column 6: error parsing attribute name`
	 * - as HTML it is accepted as attribute name
	 */
	SYNTAX_InvalidAttributeName: {
		source: '<xml><child 123=""/></xml>',
		level: 'error',
		match: (msg) => /invalid attribute/.test(msg),
	},
	/**
	 * Triggered by lib/sax.js:392, caught in 208
	 * This sample doesn't follow the specified grammar.
	 * In the browser:
	 * - in XML it is reported as `error on line 1 at column 8: error parsing attribute name`
	 * - in HTML it produces `<xml><a <="" xml=""></a></xml>` (invalid XML?)
	 */
	SYNTAX_ElementClosingNotConnected: {
		source: '<xml><a/ </xml>',
		level: 'error',
		match: (msg) => /must be connected/.test(msg),
	},
	/**
	 * In the browser:
	 * - for XML it is reported as
	 * `error on line 1 at column 10: Specification mandates value for attribute attr`
	 * - for HTML is uses the attribute as one with no value and adds `"value"` to the attribute name
	 *   and is not reporting any issue.
	 */
	SYNTAX_AttributeValueMustAfterEqual: {
		source: '<xml attr"value" />',
		level: 'warning',
		match: (msg) => /attribute value must after "="/.test(msg),
	},
	/**
	 * In the browser:
	 * - for XML it is reported as `error on line 1 at column 11: AttValue: " or ' expected`
	 * - for HTML is wraps `value"` with quotes and is not reporting any issue.
	 */
	SYNTAX_AttributeMissingStartingQuote: {
		source: '<xml attr=value" />',
		level: 'warning',
		match: (msg) => /missed start quot/.test(msg),
	},
	/**
	 * Triggered by lib/sax.js:264, caught in 208.
	 * TODO: Comment indicates fatalError, change to use errorHandler.fatalError?
	 *
	 * In the browser:
	 * - for XML it is reported as `error on line 1 at column 20: AttValue: ' expected`
	 * - for HTML nothing is added to the DOM.
	 */
	SYNTAX_AttributeMissingEndingQuote: {
		source: '<xml><child attr="value /></xml>',
		level: 'error',
		match: (msg) => /attribute value no end .* match/.test(msg),
	},
	/**
	 * Triggered by lib/sax.js:324
	 * In the browser:
	 * - for XML it is reported as `error on line 1 at column 11: AttValue: " or ' expected`
	 * - for HTML is wraps `value/` with quotes and is not reporting any issue.
	 */
	SYNTAX_AttributeMissingQuote: {
		source: '<xml attr=value/>',
		level: 'warning',
		match: (msg) => / missed quot/.test(msg) && /!!/.test(msg) === false,
	},
	/**
	 * Triggered by lib/sax.js:354
	 * This is the only warning reported in this sample.
	 * For some reason the "attribute" that is reported as missing quotes
	 * has the name `&`.
	 * This case is also present in 2 tests in test/html/normalize.test.js
	 *
	 * In the browser:
	 * - for XML it is reported as `error on line 1 at column 8: AttValue: " or ' expected`
	 * - for HTML is yields `<xml a="&amp;" b="&amp;"></xml>` and is not reporting any issue.
	 */
	SYNTAX_AttributeMissingQuote2: {
		source: `<xml a=& b="&"/>`,
		level: 'warning',
		match: (msg) => / missed quot/.test(msg) && /!!/.test(msg),
	},
	/**
	 * In the browser:
	 * - for XML it is reported as `error on line 1 at column 9: AttValue: " or '
	 * expected`
	 * - for HTML is yields `<doc a1></xml>` and is not reporting any issue.
	 *
	 * But the XML specifications does not allow that:
	 *
	 * @see https://www.w3.org/TR/xml/#NT-Attribute
	 * @see https://www.w3.org/TR/xml11/#NT-Attribute
	 */
	SYNTAX_AttributeEqualMissingValue: {
		source: '<doc><child a1=></child></doc>',
		level: 'fatalError',
		skippedInHtml,
		match: (msg) => /AttValue: \\' or " expected/.test(msg),
	},
	/**
	 * In the browser this is not an issue at all, but just add an attribute without a value.
	 * But the XML specifications does not allow that:
	 *
	 * @see https://www.w3.org/TR/xml/#NT-Attribute
	 * @see https://www.w3.org/TR/xml11/#NT-Attribute
	 */
	SYNTAX_AttributeMissingValue: {
		source: '<xml attr ></xml>',
		level: 'warning',
		match: (msg) => /missed value/.test(msg) && /instead!!/.test(msg),
		skippedInHtml,
	},
	/**
	 * Triggered by lib/sax.js:376 This seems to only be reached when there are two subsequent
	 * attributes with a missing value In the browser this is not an issue at all,
	 * but just add an attribute without a value.
	 * But the XML specifications does not allow that:
	 *
	 * @see https://www.w3.org/TR/xml/#NT-Attribute
	 * @see https://www.w3.org/TR/xml11/#NT-Attribute
	 */
	SYNTAX_AttributeMissingValue2: {
		source: '<xml attr attr2 ></xml>',
		level: 'warning',
		match: (msg) => /missed value/.test(msg) && /instead2!!/.test(msg),
		skippedInHtml,
	},
	/**
	 * Non-whitespace content after the root element; the top level allows only Comment, PI or
	 * whitespace after it.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-document
	 * @see https://www.w3.org/TR/xml/#NT-Misc
	 */
	SYNTAX_SingleRootElement_ContentAfter: {
		source: '<xml/>text after',
		level: 'error',
		skippedInHtml,
		match: (msg) => /Extra content at the end of the document/.test(msg),
	},
	/**
	 * Non-whitespace content before the root element; only Comment, PI or whitespace may precede
	 * it.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-document
	 * @see https://www.w3.org/TR/xml/#NT-Misc
	 */
	SYNTAX_SingleRootElement_ContentBefore: {
		source: 'text before<xml/>',
		level: 'error',
		skippedInHtml,
		match: (msg) => /Unexpected content outside root element/.test(msg),
	},
	/**
	 * A malformed CDATA section.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-CDSect
	 */
	SYNTAX_SingleRootElement_InvalidCData: {
		source: '<!CDATA[ ] ] ><xml/>',
		level: 'fatalError',
		match: (msg) => /Invalid CDATA starting at/.test(msg),
	},
	/**
	 * A CDATA section at the top level; CDATA is only allowed inside element content.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-content
	 * @see https://www.w3.org/TR/xml/#NT-CDSect
	 */
	SYNTAX_SingleRootElement_CDataOutside: {
		source: '<!CDATA[]]><xml/>',
		level: 'fatalError',
		skippedInHtml,
		match: (msg) => /CDATA outside of element/.test(msg),
	},
	/**
	 * The generic catch-all in the `lib/sax.js` parse loop: an Error that is neither a
	 * ParseError nor a DOMException is downgraded to `errorHandler.error`. This sample
	 * reaches it via the swallowed `attribute value must after "="` throw.
	 */
	SYNTAX_ElementParseError: {
		source: '<xml><a "></xml>',
		level: 'error',
		match: (msg) => /element parse error:/.test(msg),
	},
	/**
	 * Reaches the `attribute equal must after attrName` throw (an `=` in a state that
	 * does not expect one), surfaced through the generic `element parse error:` wrapper.
	 */
	SYNTAX_AttributeEqualMustAfterAttrName: {
		source: '<xml><a b==></xml>',
		level: 'error',
		match: (msg) => /attribute equal must after attrName/.test(msg),
	},
	/**
	 * Reaches the `attribute invalid close char('/')` throw (a `/` right after `=`,
	 * i.e. state S_EQ), surfaced through the generic `element parse error:` wrapper.
	 */
	SYNTAX_AttributeInvalidCloseChar: {
		source: '<xml><a b=/></xml>',
		level: 'error',
		match: (msg) => /attribute invalid close char/.test(msg),
	},
	/**
	 * Two attributes not separated by whitespace: the second attribute name directly
	 * follows the first attribute's closing quote.
	 */
	SYNTAX_AttributeSpaceRequired: {
		source: '<xml a="1"b="2"/>',
		level: 'warning',
		match: (msg) => /attribute space is required/.test(msg),
	},
	/**
	 * A DOCTYPE appearing after the document element already exists.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-document
	 * @see https://www.w3.org/TR/xml/#NT-prolog
	 */
	SYNTAX_Doctype_NotAllowedAfterDocumentElement: {
		source: '<xml/><!DOCTYPE x>',
		level: 'fatalError',
		match: (msg) => /Doctype not allowed inside or after documentElement/.test(msg),
	},
	/**
	 * `<!D…` that is not the full `<!DOCTYPE` keyword.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-doctypedecl
	 */
	SYNTAX_Doctype_ExpectedKeyword: {
		source: '<!D>',
		level: 'fatalError',
		match: (msg) => /Expected ' \+ g\.DOCTYPE_DECL_START/.test(msg),
	},
	/**
	 * `<!DOCTYPE` not followed by whitespace.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-doctypedecl
	 */
	SYNTAX_Doctype_ExpectedWhitespaceAfterKeyword: {
		source: '<!DOCTYPE>',
		level: 'fatalError',
		match: (msg) => /Expected whitespace after ' \+ g\.DOCTYPE_DECL_START/.test(msg),
	},
	/**
	 * `<!DOCTYPE ` without a valid doctype name.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-doctypedecl
	 */
	SYNTAX_Doctype_NameMissing: {
		source: '<!DOCTYPE >',
		level: 'fatalError',
		match: (msg) => /doctype name missing or contains unexpected characters/.test(msg),
	},
	/**
	 * A PUBLIC/SYSTEM external id that does not follow the ExternalID grammar.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-ExternalID
	 */
	SYNTAX_Doctype_ExternalIdNotWellFormed: {
		source: '<!DOCTYPE x PUBLIC>',
		level: 'fatalError',
		match: (msg) => /doctype external id is not well-formed/.test(msg),
	},
	/**
	 * HTML-only legacy `SYSTEM` (lowercase, so not the XML ExternalID form) with no following
	 * whitespace. In XML the same sample throws a different fatalError, so the fatalError
	 * assertion still holds in both mimeTypes.
	 *
	 * @see https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-whitespace-after-doctype-system-keyword
	 * @see https://html.spec.whatwg.org/multipage/syntax.html#the-doctype
	 */
	HTML_Doctype_ExpectedWhitespaceAfterSystem: {
		source: '<!DOCTYPE html system"about:legacy-compat">',
		level: 'fatalError',
		match: (msg) => /Expected whitespace after ' \+ g\.SYSTEM/.test(msg),
	},
	/**
	 * A DOCTYPE that never reaches its closing `>`.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-doctypedecl
	 */
	SYNTAX_Doctype_NotTerminated: {
		source: '<!DOCTYPE x y>',
		level: 'fatalError',
		match: (msg) => /doctype not terminated with > at position/.test(msg),
	},
	/**
	 * A PI inside the (XML-only) doctype internal subset that does not follow the PI grammar.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-PI
	 */
	SYNTAX_Doctype_InternalSubset_PINotWellFormed: {
		source: '<!DOCTYPE x [<? ]>',
		level: 'fatalError',
		skippedInHtml,
		match: (msg) => /processing instruction is not well-formed at position/.test(msg),
	},
	/**
	 * A markup declaration inside the internal subset that starts with none of `<!`, `<?`, `%`.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-intSubset
	 * @see https://www.w3.org/TR/xml/#NT-markupdecl
	 */
	SYNTAX_Doctype_InternalSubset_MarkupDeclaration: {
		source: '<!DOCTYPE x [z]>',
		level: 'fatalError',
		skippedInHtml,
		match: (msg) => /Error detected in Markup declaration/.test(msg),
	},
	/**
	 * A `<!…` markup declaration inside the internal subset that matches no known decl.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-markupdecl
	 */
	SYNTAX_Doctype_InternalSubset_Error: {
		source: '<!DOCTYPE x [<!Z>]>',
		level: 'fatalError',
		skippedInHtml,
		match: (msg) => /Error in internal subset at position/.test(msg),
	},
	/**
	 * An internal subset opened with `[` that never reaches its closing `]`.
	 *
	 * @see https://www.w3.org/TR/xml/#NT-doctypedecl
	 * @see https://www.w3.org/TR/xml/#NT-intSubset
	 */
	SYNTAX_Doctype_InternalSubset_MissingClosingBracket: {
		source: '<!DOCTYPE x [',
		level: 'fatalError',
		skippedInHtml,
		match: (msg) => /doctype internal subset is not well-formed, missing \]/.test(msg),
	},
	/**
	 * `<!…` (not a comment, CDATA or DOCTYPE) — the default of the `<!` dispatch.
	 */
	SYNTAX_NotWellFormedExclamation: {
		source: '<!X>',
		level: 'fatalError',
		match: (msg) => /Not well-formed XML starting with/.test(msg),
	},
	/**
	 * `<?…` that does not follow the PI grammar.
	 */
	SYNTAX_InvalidProcessingInstruction: {
		source: '<??>',
		level: 'fatalError',
		match: (msg) => /Invalid processing instruction starting at position/.test(msg),
	},
	/**
	 * `<?xml …?>` at the start of the document that does not follow the XMLDecl grammar.
	 */
	SYNTAX_XmlDeclarationNotWellFormed: {
		source: '<?xml version?>',
		level: 'fatalError',
		match: (msg) => /xml declaration is not well-formed/.test(msg),
	},
};

const LINE_TO_ERROR_INDEX = {
	'': `This file is gitignored and is generated by ${__filename} every time the tests run.`,
};

/**
 * Classify a `lib/sax.js` reporting line (or an extracted errorType token) into the single
 * level it triggers, by its mechanism. A plain substring test for the level would misfire,
 * because the word "error" is contained in both `errorHandler.warning` and
 * `errorHandler.fatalError`.
 *
 * - `errorHandler.fatalError(…)` and `throw new ParseError(…)` abort parsing → 'fatalError'
 * - `errorHandler.warning(…)` → 'warning'
 * - `errorHandler.error(…)` and `throw new Error(…)` (caught and downgraded to
 * `errorHandler.error`) → 'error'
 *
 * @param {string} lineOrErrorType
 * @returns {'error' | 'warning' | 'fatalError'}
 */
function classifyLevel(lineOrErrorType) {
	if (/fatalError|ParseError/.test(lineOrErrorType)) return 'fatalError';
	if (/warning/i.test(lineOrErrorType)) return 'warning';
	return 'error';
}

/**
 * To avoid to have exact lines in snapshots, but still being able to verify,
 * that a certain error was reported in the expected order,
 * this method indexes all cases of - thrown errors - calls to one of the errorHandler methods
 * and adds them to the exported LINE_TO_ERROR_INDEX.
 *
 * It also checks that every match configured in REPORTED only matches a single line,
 * and adds the related key to the index as `reportedAs`.
 * Any failing check will throw, so it prevents the tests from being executed.
 *
 * The result is written to reported.json for easier human introspection.
 * The file is only written, not read by any code, the source code is the only source of truth.
 *
 * @param fileNameInKey
 * The part of the path that is supposed to be part of the key.
 */
function parseErrorLines(fileNameInKey) {
	let errorIndex = 0;
	const source = fs.readFileSync(path.join(__dirname, '..', '..', fileNameInKey), 'utf8').split('\n');
	source.forEach((lineFull, lineNumber) => {
		const line = lineFull.trim();
		if (/^(\/\/|\/\*|\* ?)/.test(line) || line.length === 0) {
			// ignoring single or multiline comments
			return;
		}
		if (/^(\w+Error\.prototype|function \w+Error)/.test(line)) {
			// ignoring "class" definitions for custom errors
			return;
		}
		const match = /(warning|[\w.]*error)\((.*)\)/i.exec(line);

		// ignore lines that don't throw or report an error or warning
		if (!match) return;

		const [, errorType, message] = match;

		// the first line is line 1, not line 0!
		LINE_TO_ERROR_INDEX[`${fileNameInKey}:${lineNumber + 1}`] = {
			errorType,
			index: errorIndex++,
			line,
			message,
		};
	});
	Object.entries(REPORTED).forEach(([key, value]) => {
		const matches = source.reduce((lines, currentLine, i) => {
			if (classifyLevel(currentLine) === value.level && value.match(currentLine)) {
				// the first line is line 1, not line 0!
				lines.push(i + 1);
			}
			return lines;
		}, []);
		if (matches.length === 0) throw `${key} doesn't match any line in ${fileNameInKey}`;
		if (matches.length > 1) throw `${key} matches multiple lines in ${fileNameInKey}`;
		const lineKey = `${fileNameInKey}:${matches[0]}`;
		if (lineKey in LINE_TO_ERROR_INDEX) {
			LINE_TO_ERROR_INDEX[lineKey].reportedAs = key;
		} else {
			throw new Error(`line not mapped: ${lineKey} reportedAs $${key}`);
		}
	});

	const REPORTED_JSON = path.join(__dirname, 'reported.json');
	const data = JSON.stringify(LINE_TO_ERROR_INDEX, null, 2);
	const currentData = fs.existsSync(REPORTED_JSON) ? fs.readFileSync(REPORTED_JSON, 'utf8') : '';
	if (data !== currentData) {
		fs.writeFileSync(REPORTED_JSON, data, 'utf8');
	}
}
parseErrorLines(path.join('lib', 'sax.js'));

module.exports = {
	classifyLevel,
	LINE_TO_ERROR_INDEX,
	REPORTED,
};
