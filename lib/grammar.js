'use strict';

/**
 * Removes `[`, `]` and any trailing quantifiers from the source of a RegExp
 * @param {RegExp} regexp
 */
function chars(regexp) {
	if (regexp.source[0] !== '[') {
		throw new Error(regexp + ' can not be used with chars');
	}
	return regexp.source.slice(1, regexp.source.lastIndexOf(']'));
}

/**
 * Creates a new character list regular expression,
 * by removing `search` from the source of `regexp`.
 * @param {RegExp} regexp
 * @param {string} search the characters to remove
 * @returns {RegExp & {chars:string}}
 */
function chars_without(regexp, search) {
	if (regexp.source[0] !== '[') {
		throw new Error('/' + regexp.source + '/ can not be used with chars_without');
	}
	if (!search) {
		throw new Error(search + ' is falsy');
	}
	if (regexp.source.indexOf(search) === -1) {
		throw new Error('"' + search + '" is not is /' + regexp.source + '/');
	}
	var result = new RegExp(regexp.source.replace(search, ''));
	result.chars = chars(result);
	return result;
}

/**
 * Combines and Regular expressions correctly by using `RegExp.source`.
 * @param {...(RegExp | string)[]} args
 * @returns {RegExp}
 */
function reg(args) {
	var self = this;
	return new RegExp(
		Array.prototype.slice
			.call(arguments)
			.map(function (part, index) {
				var isStr = typeof part === 'string';
				if (isStr && self === undefined && part === '|') {
					throw new Error('use regg instead of reg to wrap expressions with `|`!');
				}
				return isStr ? part : part.source;
			})
			.join(''),
		'm'
	);
}

/**
 * Like `reg` but adds a `chars` property by applying the function with the same name.
 * @param {...(RegExp | string)[]} args
 * @returns {RegExp & {chars:string}}
 */
function reg_chars(args) {
	// var args = Array.prototype.slice.call(arguments);
	var result = reg.apply(reg_chars, arguments);
	result.chars = chars(result);
	return result;
}

/**
 * Like `reg` but wraps the expression in `(?:`,`)` to create a non tracking group.
 * @param {...(RegExp | string)[]} args
 * @returns {RegExp}
 */
function regg(args) {
	if (arguments.length === 0) {
		throw new Error('no parameters provided');
	}
	return reg.apply(regg, ['(?:'].concat(Array.prototype.slice.call(arguments), [')']));
}

// https://www.w3.org/TR/REC-xml/#document
// [1] document ::= prolog element Misc*

// https://www.w3.org/TR/REC-xml/#char32
// any Unicode character, excluding the surrogate blocks, FFFE, and FFFF.
// [2] Char ::= #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] | [#x10000-#x10FFFF]
var Char = /[\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD]/; // | [#x10000-#x10FFFF]

// https://www.w3.org/TR/REC-xml/#white
// [3] S ::= (#x20 | #x9 | #xD | #xA)+
var S_1 = /[\x20\x09\x0D\x0A]/;
var S = reg(S_1, '+');
S.chars = chars(S);
var S_01 = reg(regg(S), '?');

//[4] NameStartChar ::= ":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
var NameStartChar =
	/[:A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/; //\u10000-\uEFFFF
NameStartChar.chars = chars(NameStartChar);

// https://www.w3.org/TR/REC-xml/#NT-NameChar
//[4a] NameChar ::= NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
var NameChar = reg_chars('[', NameStartChar.chars, chars(/[-.0-9\xB7]/), chars(/[\u0300-\u036F\u203F-\u2040]/), ']');
// https://www.w3.org/TR/REC-xml/#NT-Name
// [5] Name ::= NameStartChar (NameChar)*
var Name = reg(NameStartChar, NameChar, '*');

// [7] Nmtoken ::= (NameChar)+
var Nmtoken = reg(NameChar, '+');
// [8] Nmtokens ::= Nmtoken (#x20 Nmtoken)*
var Nmtokens = reg(Nmtoken, regg(/\x20/, Nmtoken), '*');

// [68] EntityRef ::= '&' Name ';' [WFC: Entity Declared] [VC: Entity Declared] [WFC: Parsed Entity] [WFC: No Recursion]
var EntityRef = reg('&', Name, ';');
// [66] CharRef ::= '&#' [0-9]+ ';' | '&#x' [0-9a-fA-F]+ ';' [WFC: Legal Character]
var CharRef = regg(/&#[0-9]+;|&#x[0-9a-fA-F]+;/);

// [67] Reference ::= EntityRef | CharRef
var Reference = regg(EntityRef, '|', CharRef);

// [69] PEReference ::= '%' Name ';'
var PEReference = reg('%', Name, ';');

// [9] EntityValue ::= '"' ([^%&"] | PEReference | Reference)* '"'
//                           |  "'" ([^%&'] | PEReference | Reference)* "'"
var EntityValue = regg(
	regg('"', regg(/[^%&"]/, '|', PEReference, '|', Reference), '*', '"'),
	'|',
	regg("'", regg(/[^%&']/, '|', PEReference, '|', Reference), '*', "'")
);

// [10] AttValue ::= '"' ([^<&"] | Reference)* '"' | "'" ([^<&'] | Reference)* "'"
var AttValue = regg('"', regg(/[^<&"]/, '|', Reference), '*', '"', '|', "'", regg(/[^<&']/, '|', Reference), '*', "'");

// https://www.w3.org/TR/xml-names/#ns-decl
// https://www.w3.org/TR/xml-names/#ns-qualnames
// NameStartChar without ":"
var NCNameStartChar = chars_without(NameStartChar, ':');
// https://www.w3.org/TR/xml-names/#orphans
// [5] NCNameChar ::= NameChar - ':'
// An XML NameChar, minus the ":"
var NCNameChar = chars_without(NameChar, ':');
// https://www.w3.org/TR/xml-names/#NT-NCName
// [4] NCName ::= Name - (Char* ':' Char*)
// An XML Name, minus the ":"
var NCName = reg(NCNameStartChar, NCNameChar, '*');

// https://www.w3.org/TR/xml-names/#ns-qualnames
// [7] QName ::= PrefixedName | UnprefixedName
//                       === (NCName ':' NCName) | NCName
// [8] PrefixedName ::= Prefix ':' LocalPart
//                       === NCName ':' NCName
// [9] UnprefixedName ::= LocalPart
//                       === NCName
// [10] Prefix ::= NCName
// [11] LocalPart ::= NCName
var QName = regg(regg(NCName, ':', NCName), '|', NCName);

// [11] SystemLiteral ::= ('"' [^"]* '"') | ("'" [^']* "'")
var SystemLiteral = regg(/"[^"]*"|'[^']*'/);

// [15]   	Comment	   ::=   	'<!--' ((Char - '-') | ('-' (Char - '-')))* '-->'
var Comment = reg('<!--', regg(chars_without(Char, '-'), '|', regg('-', chars_without(Char, '-'))), '*', '-->');

// [17]   	PITarget	   ::=   	Name - (('X' | 'x') ('M' | 'm') ('L' | 'l'))
// target /xml/i is not excluded!
// [16]   	PI	   ::=   	'<?' PITarget (S (Char* - (Char* '?>' Char*)))? '?>'
// exclusion of `?>` is not possible with RegExp!
var PI_unsafe = reg(/<\?/, Name, S, Char, '*', /\?>/);

// [13] PubidChar ::= #x20 | #xD | #xA | [a-zA-Z0-9] | [-'()+,./:=?;!*#@$_%]
var PubidChar = /[\x20\x0D\x0Aa-zA-Z0-9-'()+,./:=?;!*#@$_%]/;
PubidChar.chars = chars(PubidChar);

// [12] PubidLiteral ::= '"' PubidChar* '"' | "'" (PubidChar - "'")* "'"
var PubidLiteral = regg('"', PubidChar, '*"', '|', "'", chars_without(PubidChar, "'"), "*'");

// [28a] DeclSep ::= PEReference | S
var DeclSep = regg(PEReference, '|', S);

// https://www.w3.org/TR/REC-xml/#NT-Mixed
// [51] Mixed ::= '(' S? '#PCDATA' (S? '|' S? Name)* S? ')*'
//                | '(' S? '#PCDATA' S? ')'
var Mixed = regg(
	reg(/\(/, S_01, '#PCDATA', regg(S_01, /\|/, S_01, Name), '*', S_01, /\)\*/),
	'|',
	reg(/\(/, S_01, '#PCDATA', S_01, /\)/)
);

var _children_quantity = /[?*+]?/;
// [49] choice ::= '(' S? cp ( S? '|' S? cp )+ S? ')' [VC: Proper Group/PE Nesting]
// [50] seq ::= '(' S? cp ( S? ',' S? cp )* S? ')' [VC: Proper Group/PE Nesting]
// simplification to solve circular referencing, but doesn't check validity constraint "Proper Group/PE Nesting"
var _choice_or_seq_uv = reg('[', NameChar.chars, S.chars, chars(_children_quantity), '()|,]');
// [48] cp ::= (Name | choice | seq) ('?' | '*' | '+')?
//               === (Name | '(' S? cp ( S? '|' S? cp )+ S? ')' | '(' S? cp ( S? ',' S? cp )* S? ')') ('?' | '*' | '+')?
//               !== (Name | [_choice_or_seq_uv]*) ('?' | '*' | '+')?
// simplification to solve circular referencing, but doesn't check validity constraint "Proper Group/PE Nesting"
var cp_uv = reg(regg(Name, _choice_or_seq_uv, '*'), _children_quantity);
var choice_uv = regg(/\(/, S_01, cp_uv, regg(S_01, /\|/, S_01, cp_uv), '+', S_01, /\)/);
var seq_uv = regg(/\(/, S_01, cp_uv, regg(S_01, /,/, S_01, cp_uv), '+', S_01, /\)/);

// [47] children ::= (choice | seq) ('?' | '*' | '+')?
// simplification to solve circular referencing, but doesn't check validity constraint "Proper Group/PE Nesting"
var children_uv = reg(regg(choice_uv, seq_uv), _children_quantity);

// https://www.w3.org/TR/REC-xml/#NT-contentspec
// [46] contentspec ::= 'EMPTY' | 'ANY' | Mixed | children
var contentspec_uv = regg('EMPTY', '|', 'ANY', '|', Mixed, '|', children_uv);

// [45] elementdecl ::= '<!ELEMENT' S Name S contentspec S? '>'
var elementdecl_uv = reg('<!ELEMENT', S, Name, S, contentspec_uv, S_01, '>');

// [58] NotationType ::= 'NOTATION' S '(' S? Name (S? '|' S? Name)* S? ')'
//     [VC: Notation Attributes] [VC: One Notation Per Element Type] [VC: No Notation on Empty Element] [VC: No Duplicate Tokens]
var NotationType = reg('NOTATION', S, /\(/, S_01, Name, regg(S_01, '|', S_01, Name), '*', S_01, /\)/);
// [59] Enumeration ::= '(' S? Nmtoken (S? '|' S? Nmtoken)* S? ')' [VC: Enumeration] [VC: No Duplicate Tokens]
var Enumeration = reg(/\(/, S_01, Nmtoken, regg(S_01, '|', S_01, Nmtoken), '*', S_01, /\)/);

// [57] EnumeratedType ::= NotationType | Enumeration
var EnumeratedType = regg(NotationType, '|', Enumeration);

// [55] StringType ::= 'CDATA'
// [56] TokenizedType ::= 'ID' [VC: ID] [VC: One ID per Element Type] [VC: ID Attribute Default]
//         						  | 'IDREF' [VC: IDREF]
//     									| 'IDREFS' [VC: IDREF]
//     									| 'ENTITY' [VC: Entity Name]
//     									| 'ENTITIES' [VC: Entity Name]
//     									| 'NMTOKEN' [VC: Name Token]
//     									| 'NMTOKENS' [VC: Name Token]
// [54] AttType ::= StringType | TokenizedType | EnumeratedType
var AttType = regg(/CDATA|ID|IDREF|IDREFS|ENTITY|NMTOKEN|NMTOKENS/, '|', EnumeratedType);

// [60] DefaultDecl ::= '#REQUIRED' | '#IMPLIED' | (('#FIXED' S)? AttValue)
// [VC: Required Attribute] [VC: Attribute Default Value Syntactically Correct] [WFC: No < in Attribute Values]
// [VC: Fixed Attribute Default] [WFC: No External Entity References]
var DefaultDecl = regg(/#REQUIRED|#IMPLIED/, '|', regg(regg('#FIXED', S), '?', AttValue));

// [53] AttDef ::= S Name S AttType S DefaultDecl
var AttDef = regg(S, Name, S, AttType, S, DefaultDecl);

// [52] AttlistDecl ::= '<!ATTLIST' S Name AttDef* S? '>'
var AttlistDecl = reg('<!ATTLIST', S, Name, AttDef, '*', S_01, '>');

// [75] ExternalID ::= 'SYSTEM' S SystemLiteral | 'PUBLIC' S PubidLiteral S SystemLiteral
var ExternalID = regg(regg('SYSTEM', S, SystemLiteral), '|', regg('PUBLIC', S, PubidLiteral, S, SystemLiteral));

// [76] NDataDecl ::= S 'NDATA' S Name[VC: Notation Declared]
var NDataDecl = reg(S, 'NDATA', S, Name);

// [73] EntityDef ::= EntityValue | (ExternalID NDataDecl?)
var EntityDef = regg(EntityValue, '|', regg(ExternalID, NDataDecl, '?'));
// [71] GEDecl ::= '<!ENTITY' S Name S EntityDef S? '>'
var GEDecl = reg('<!ENTITY', S, Name, S, EntityDef, S_01, '>');
// [74] PEDef ::= EntityValue | ExternalID
var PEDef = regg(EntityValue, '|', ExternalID);
// [72] PEDecl ::= '<!ENTITY' S '%' S Name S PEDef S? '>'
var PEDecl = reg('<!ENTITY', S, '%', S, Name, S, PEDef, S_01, '>');
// [70] EntityDecl ::= GEDecl | PEDecl
var EntityDecl = regg(GEDecl, '|', PEDecl);

// [83]   	PublicID	   ::=   	'PUBLIC' S PubidLiteral
var PublicID = reg('PUBLIC', S, PubidLiteral);
// [82]   	NotationDecl	   ::=   	'<!NOTATION' S Name S (ExternalID | PublicID) S? '>'	[VC: Unique Notation Name]
var NotationDecl = reg('<!NOTATION', S, Name, S, regg(ExternalID, '|', PublicID), S_01, '>');

// [29] markupdecl ::= elementdecl | AttlistDecl | EntityDecl | NotationDecl | PI | Comment
var markupdecl_uv = regg(elementdecl_uv, '|', AttlistDecl, '|', EntityDecl, '|', NotationDecl, '|', PI_unsafe, '|', Comment);

// [28b] intSubset ::= (markupdecl | DeclSep)*
var intSubset_uv = reg(regg(markupdecl_uv, '|', DeclSep), '*');

// [28] doctypedecl ::=          '<!DOCTYPE' S Name (S ExternalID)? S? ('[' intSubset ']' S?)? '>'
var doctypedecl_uv = reg('<!DOCTYPE', S, Name, regg(S, ExternalID), '?', S_01, regg(/\[/, intSubset_uv, /]/, S_01), '?', '>');

exports.chars = chars;
exports.chars_without = chars_without;
exports.reg = reg;
exports.reg_chars = reg_chars;
exports.regg = regg;
exports.doctypedecl_uv = doctypedecl_uv;
exports.ExternalID = ExternalID;
exports.Name = Name;
exports.QName = QName;
exports.S = S;
exports.SystemLiteral = SystemLiteral;