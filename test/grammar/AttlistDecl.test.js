'use strict';

const { describe, expect, test } = require('@jest/globals');
const { AttlistDecl, S, Name, S_OPT } = require('../../lib/grammar');

describe('AttlistDecl', () => {
	test('should contain Name six times', () => {
		expect(AttlistDecl.source.split(Name.source)).toHaveLength(7);
	});
	test('should contain S six times', () => {
		expect(AttlistDecl.source.split(S.source)).toHaveLength(7);
	});
	test('should contain S_OPT seven times', () => {
		expect(AttlistDecl.source.split(S_OPT.source)).toHaveLength(10);
	});
	[
		`<!ATTLIST target Name CDATA "">`,
		`<!ATTLIST target Name ID #REQUIRED >`,
		`<!ATTLIST target Name ID 'AttValue'>`,
		`<!ATTLIST target Name IDREF '&EntityRef;&#123;&#x0A; AttValue'>`,
		`<!ATTLIST target Name IDREFS #IMPLIED >`,
		`<!ATTLIST target Name ENTITY #FIXED 'AttValue'>`,
		`<!ATTLIST target Name ENTITIES 'AttValue'>`,
		`<!ATTLIST target Name NMTOKEN 'AttValue'>`,
		`<!ATTLIST target Name NMTOKENS 'AttValue'>`,
		`<!ATTLIST target Name (Enumeration|NmToken) 'AttValue'>`,
		`<!ATTLIST target Name NOTATION (Name|Name) 'AttValue'>`,
	].forEach((valid) =>
		test(`should match different AttType and AttValue ${valid}`, () => {
			expect(AttlistDecl.exec(valid)[0]).toBe(valid);
		})
	);
	[
		`<!ATTLIST termdef
id      ID      #REQUIRED
name    CDATA   #IMPLIED>`,
		`<!ATTLIST list type (bullets|ordered|glossary) "ordered">`,
		`<!ATTLIST form method  CDATA   #FIXED "POST">`,
		`<!ATTLIST poem xml:space (default|preserve) 'preserve'>`,
		`<!ATTLIST pre xml:space (preserve) #FIXED 'preserve'>`,
		`<!ATTLIST target xml:lang CDATA #IMPLIED>`,
		`<!ATTLIST poem xml:lang CDATA 'fr'>`,
		`<!ATTLIST gloss xml:lang CDATA 'en'>`,
		`<!ATTLIST note xml:lang CDATA 'en'>`,
		// https://en.wikipedia.org/wiki/Document_type_definition#Attribute_list_declarations
		`<!ATTLIST img
   src    CDATA          #REQUIRED
   id     ID             #IMPLIED
   sort   CDATA          #FIXED "true"
   print  (yes | no) "yes"
>`,
	].forEach((valid) =>
		test(`should match examples from spec ${valid}`, () => {
			expect(AttlistDecl.exec(valid)[0]).toBe(valid);
		})
	);
	[`<!ATTLIST\n \r\tpoem\n \r\txml:space\n \r\t(default|preserve)\n \r\t'preserve'\n \r\t>`].forEach((valid) =>
		test('should accept all spaces in all places', () => {
			expect(AttlistDecl.exec(valid)[0]).toBe(valid);
		})
	);
});
