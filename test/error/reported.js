'use strict';
const fs = require('fs');
const path = require('path');

/**
 * @typedef ErrorReport
 * @property {string} source the XML snippet
 * @property {'error'|'warning'|'fatalError'} level the name of the method triggered
 * @property {?function(msg:string):boolean} match to pick the relevant report when there are multiple
 * @property {?boolean} skippedInHtml Is the error reported when parsing HTML?
 */
/**
 * A collection of XML samples and related information that cause the XMLReader
 * to call methods on `errorHandler`.
 */
const REPORTED = {
	/**
	 * Entities need to be in the entityMap to be converted as part of parsing.
	 * xmldom currently doesn't parse entities declared in DTD.
	 *
	 * @see https://www.w3.org/TR/2008/REC-xml-20081126/#wf-entdeclared
	 * @see https://www.w3.org/TR/2006/REC-xml11-20060816/#wf-entdeclared
	 */
	WF_EntityDeclared: {
		source: '<xml>&e;</xml>',
		level: 'error',
		match: (msg) => /entity not found/.test(msg),
	},
	/**
	 * Well-formedness constraint: Unique Att Spec
	 *
	 * An attribute name must not appear more than once
	 * in the same start-tag or empty-element tag.
	 *
	 * In the browser:
	 * - as XML it is reported as `error on line 1 at column 17: Attribute a redefined`
	 * - as HTML only the first definition is considered
	 *
	 * In xmldom the behavior is different for namespaces (picks first)
	 * than for other attributes (picks last),
	 * which can be a security issue.
	 *
	 * @see https://www.w3.org/TR/2008/REC-xml-20081126/#uniqattspec
	 * @see https://www.w3.org/TR/2006/REC-xml11-20060816/#uniqattspec
	 */
	WF_DuplicateAttribute: {
		source: '<xml a="1" a="2"></xml>',
		level: 'fatalError',
		match: (msg) => /Attribute .* redefined/.test(msg),
	},
	/**
	 * This sample doesn't follow the specified grammar.
	 * In the browser it is reported as `error on line 1 at column 14: expected '>'`,
	 * but still adds the root level element to the dom.
	 */
	SYNTAX_EndTagNotComplete: {
		source: '<xml></xml',
		level: 'error',
		match: (msg) => /end tag name/.test(msg) && /is not complete/.test(msg),
	},
	/**
	 * This sample doesn't follow the specified grammar.
	 * In the browser it is reported as `error on line 1 at column 21: expected '>'`,
	 * but still adds the root level element and inner tag to the dom.
	 */
	SYNTAX_EndTagMaybeNotComplete: {
		source: '<xml><inner></inner </xml>',
		level: 'error',
		skippedInHtml: true,
		match: (msg) => /end tag name/.test(msg) && /maybe not complete/.test(msg),
	},
	/**
	 * This sample doesn't follow the specified grammar.
	 * In the browser it is reported as `error on line 1 at column 6: Comment not terminated`.
	 */
	SYNTAX_UnclosedComment: {
		source: '<xml></xml><!--',
		level: 'error',
		match: (msg) => /Unclosed comment/.test(msg),
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
	 * This sample doesn't follow the specified grammar.
	 * In the browser it is reported as `error on line 1 at column 5: Couldn't find end of Start Tag xml`.
	 */
	SYNTAX_UnexpectedEndOfInput: {
		source: '<xml',
		level: 'error',
		match: (msg) => /unexpected end of input/.test(msg),
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
	 * In the Browser (for XML) this is reported as
	 * `error on line 1 at column 6: Extra content at the end of the document`
	 * for HTML it's added to the DOM without anything being reported.
	 */
	WF_UnclosedXmlAttribute: {
		source: '<xml>',
		level: 'warning',
		skippedInHtml: true,
		match: (msg) => /unclosed xml attribute/.test(msg),
	},
	/**
	 * In the browser:
	 * - for XML it is reported as
	 * `error on line 1 at column 10: Specification mandates value for attribute attr`
	 * - for HTML is uses the attribute as one with no value and adds `"value"` to the attribute name
	 *   and is not reporting any issue.
	 */
	WF_AttributeValueMustAfterEqual: {
		source: '<xml attr"value" />',
		level: 'warning',
		match: (msg) => /attribute value must after "="/.test(msg),
	},
	/**
	 * In the browser:
	 * - for XML it is reported as `error on line 1 at column 11: AttValue: " or ' expected`
	 * - for HTML is wraps `value"` with quotes and is not reporting any issue.
	 */
	WF_AttributeMissingStartingQuote: {
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
	WF_AttributeMissingQuote: {
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
	WF_AttributeMissingQuote2: {
		source: `<xml a=& b="&"/>`,
		level: 'warning',
		match: (msg) => / missed quot/.test(msg) && /!!/.test(msg),
	},
	/**
	 * In the browser:
	 * - for XML it is reported as `error on line 1 at column 9: AttValue: " or ' expected`
	 * - for HTML is yields `<doc a1></xml>` and is not reporting any issue.
	 *
	 * But the XML specifications does not allow that:
	 * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-Attribute
	 * @see https://www.w3.org/TR/2006/REC-xml11-20060816/#NT-Attribute
	 */
	SYNTAX_AttributeEqualMissingValue: {
		source: '<doc><child a1=></child></doc>',
		level: 'error',
		match: (msg) => /attribute value missed!!/.test(msg),
	},
	/**
	 * In the browser this is not an issue at all, but just add an attribute without a value.
	 * But the XML specifications does not allow that:
	 * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-Attribute
	 * @see https://www.w3.org/TR/2006/REC-xml11-20060816/#NT-Attribute
	 */
	WF_AttributeMissingValue: {
		source: '<xml attr ></xml>',
		level: 'warning',
		match: (msg) => /missed value/.test(msg) && /instead!!/.test(msg),
		skippedInHtml: true,
	},
	/**
	 * Triggered by lib/sax.js:376
	 * This seems to only be reached when there are two subsequent attributes with a missing value
	 * In the browser this is not an issue at all, but just add an attribute without a value.
	 * But the XML specifications does not allow that:
	 * @see https://www.w3.org/TR/2008/REC-xml-20081126/#NT-Attribute
	 * @see https://www.w3.org/TR/2006/REC-xml11-20060816/#NT-Attribute
	 */
	WF_AttributeMissingValue2: {
		source: '<xml attr attr2 ></xml>',
		level: 'warning',
		match: (msg) => /missed value/.test(msg) && /instead2!!/.test(msg),
		skippedInHtml: true,
	},
};

const LINE_TO_ERROR_INDEX = {
	'': `This file is gitignored and is generated by ${__filename} every time the tests run.`,
};

/**
 * To avoid to have exact lines in snapshots, but still being able to verify,
 * that a certain error was reported in the expected order,
 * this method indexes all cases of
 * - thrown errors
 * - calls to one of the errorHandler methods
 * and adds them to the exported LINE_TO_ERROR_INDEX.
 *
 * It also checks that every match configured in REPORTED only matches a single line,
 * and adds the related key to the index as `reportedAs`.
 * Any failing check will throw, so it prevents the tests from being executed.
 *
 * The result is written to reported.json for easier human introspection.
 * The file is only written, not read by any code, the source code is the only source of truth.
 *
 * @param fileNameInKey the part of the path that is supposed to be part of the key
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
			if (new RegExp(value.level, 'i').test(currentLine) && value.match(currentLine)) {
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
	fs.writeFileSync(path.join(__dirname, 'reported.json'), JSON.stringify(LINE_TO_ERROR_INDEX, null, 2), 'utf8');
}
parseErrorLines(path.join('lib', 'sax.js'));

module.exports = {
	LINE_TO_ERROR_INDEX,
	REPORTED,
};
