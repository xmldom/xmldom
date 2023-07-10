'use strict';

const { getTestParser } = require('../get-test-parser');
const { MIME_TYPE } = require('../../lib/conventions');

/*
[11]   	SystemLiteral::=   	('"' [^"]* '"') | ("'" [^']* "'")
[12]   	PubidLiteral ::=   	'"' PubidChar* '"' | "'" (PubidChar - "'")* "'"
[13]   	PubidChar	   ::=   	#x20 | #xD | #xA | [a-zA-Z0-9] | [-'()+,./:=?;!*#@$_%]

[28]   	doctypedecl	 ::=   	'<!DOCTYPE' S Name (S ExternalID)? S? ('[' intSubset ']' S?)? '>'
[28a]  	DeclSep	     ::=   	PEReference | S	[WFC: PE Between Declarations]
[28b]  	intSubset	   ::=   	(markupdecl | DeclSep)*
[29]   	markupdecl	 ::=   	elementdecl | AttlistDecl | EntityDecl | NotationDecl | PI | Comment

[67]   	Reference	   ::=   	EntityRef | CharRef
[68]   	EntityRef	   ::=   	'&' Name ';'
[69]   	PEReference	 ::=   	'%' Name ';'
[75]   	ExternalID	 ::=   	'SYSTEM' S SystemLiteral | 'PUBLIC' S PubidLiteral S SystemLiteral

doctypedecl with ExternalID inlined
	'<!DOCTYPE' S Name (
		S 'SYSTEM' S SystemLiteral | 'PUBLIC' S PubidLiteral S SystemLiteral
	)? S? ('[' intSubset ']' S?)? '>'
 */
describe('doctype', () => {
	test.each([
		['system outer single', `<!DOCTYPE x SYSTEM "'"><x/>`, `"'"`, ''],
		['system outer double', `<!DOCTYPE x SYSTEM '"'><x/>`, `'"'`, ''],
		['public outer single', `<!DOCTYPE x PUBLIC 'quot' "'"><x/>`, `"'"`, `'quot'`],
		['public outer double', `<!DOCTYPE x PUBLIC "'" "'"><x/>`, `"'"`, `"'"`],
	])('should parse single line DOCTYPE with mixed quotes (%s %s)', (_, source, expectedSystem, expectedPublic) => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString(source, MIME_TYPE.XML_TEXT).firstChild;

		expect({
			SYSTEM: actual.systemId,
			PUBLIC: actual.publicId,
			name: actual.name,
			...(errors.length ? { errors } : undefined),
		}).toEqual({
			SYSTEM: expectedSystem,
			PUBLIC: expectedPublic,
			name: 'x',
		});
	});

	describe('sets Document.doctype', () => {
		test('should set it for XML documents', () => {
			const { parser } = getTestParser();
			const doc = parser.parseFromString('<!DOCTYPE name><X/>', MIME_TYPE.XML_TEXT);

			expect(doc.doctype).toBeTruthy();
			expect(doc.doctype.ownerDocument === doc).toBe(true);
			expect(doc.firstChild === doc.doctype).toBe(true);
			expect(doc.childNodes.length).toBe(2);
		});
		test('should set it for HTML documents', () => {
			const { parser } = getTestParser();
			const doc = parser.parseFromString('<!DOCTYPE html><body></body>', MIME_TYPE.HTML);

			expect(doc.doctype).toBeTruthy();
			expect(doc.doctype.ownerDocument === doc).toBe(true);
			expect(doc.firstChild === doc.doctype).toBe(true);
			expect(doc.childNodes.length).toBe(2);
		});
	});

	test('sets the internalSubset', () => {
		const internalSubset = `
  <!ENTITY foo "foo">
  <!ENTITY bar "bar">
  <!ENTITY bar "bar2">
  <!ENTITY % baz "baz">
`;

		const doctypeString = `<?xml version="1.0"?>
		<!-- >'" -->
		<!DOCTYPE name PUBLIC "identifier" "url" [${internalSubset}]>
		<name/>
		`;

		const { parser } = getTestParser();
		const doc = parser.parseFromString(doctypeString, MIME_TYPE.XML_TEXT);

		expect(doc.doctype).toHaveProperty('internalSubset', internalSubset);
	});
});
