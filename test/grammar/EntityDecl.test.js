'use strict';

const { describe, expect, test } = require('@jest/globals');
const { EntityDecl, EntityValue, ExternalID, Name, S, S_OPT } = require('../../lib/grammar');

describe('EntityValue', () => {
	test('should contain Name 4 times', () => {
		// 2 times via PEReference
		// 2 times via Reference
		expect(EntityValue.source.split(Name.source)).toHaveLength(5);
	});
});
describe('EntityDecl', () => {
	// var EntityDecl_Inlined = regg(
	// 	'<!ENTITY',
	// 	S,
	// 	/*GEDecl*/ reg(Name, S, /*EntityDef*/ regg(EntityValue, '|', regg(ExternalID, /*NDataDecl*/ regg(S, 'NDATA', S, Name), '?'))),
	// 	'|',
	// 	/*PEDecl*/ reg('%', S, Name, S, /*PEDef*/ regg(EntityValue, '|', ExternalID)),
	// 	S_OPT,
	// 	'>'
	// );
	test('should contain Name 11 times', () => {
		// 4 times in each of the two EntityValue
		expect(EntityDecl.source.split(EntityValue.source)).toHaveLength(3);
		// 3 times visible in the inlined code above,
		expect(EntityDecl.source.split(Name.source)).toHaveLength(12);
	});
	test('should contain ExternalID twice', () => {
		expect(EntityDecl.source.split(ExternalID.source)).toHaveLength(3);
	});
	test('should contain S 13 times', () => {
		expect(EntityDecl.source.split(S.source)).toHaveLength(14);
	});
	test('should contain S_OPT twice', () => {
		expect(EntityDecl.source.split(S_OPT.source)).toHaveLength(3);
	});
	[].forEach((valid) =>
		test(`should match different GEDecl cases ${valid}`, () => {
			expect(EntityDecl.exec(valid)[0]).toBe(valid);
		})
	);
	[].forEach((valid) =>
		test(`should match different PEDecl cases ${valid}`, () => {
			expect(EntityDecl.exec(valid)[0]).toBe(valid);
		})
	);
	[
		`<!ENTITY d "&#xD;">`,
		`<!ENTITY a "&#xA;">`,
		`<!ENTITY da "&#xD;&#xA;">`,
		`<!ENTITY % draft 'INCLUDE' >`,
		`<!ENTITY % final 'IGNORE' >`,
		`<!ENTITY % ISOLat2
SYSTEM "http://www.xml.com/iso/isolat2-xml.entities" >`,
		`<!ENTITY Pub-Status "This is a pre-release of the
specification.">`,
		`<!ENTITY open-hatch
SYSTEM "http://www.textuality.com/boilerplate/OpenHatch.xml">`,
		`<!ENTITY open-hatch
PUBLIC "-//Textuality//TEXT Standard open-hatch boilerplate//EN"
"http://www.textuality.com/boilerplate/OpenHatch.xml">`,
		`<!ENTITY hatch-pic
SYSTEM "../grafix/OpenHatch.gif"
NDATA gif >`,
		`<!ENTITY % YN '"Yes"' >`,
		`<!ENTITY WhatHeSaid "He said %YN;" >`,
		`<!ENTITY EndAttr "27'" >`,
		`<!ENTITY % pub    "&#xc9;ditions Gallimard" >`,
		`<!ENTITY   rights "All rights reserved" >`,
		`<!ENTITY   book   "La Peste: Albert Camus,
&#xA9; 1947 %pub;. &rights;" >`,
		`<!ENTITY example "<p>An ampersand (&#38;#38;) may be escaped
numerically (&#38;#38;#38;) or with a general entity
(&amp;amp;).</p>" >`,
		`<!ENTITY % xx '&#37;zz;'>`,
		`<!ENTITY % zz '&#60;!ENTITY tricky "error-prone" >' >`,
	].forEach((valid) =>
		test(`should match examples from spec ${valid}`, () => {
			expect(EntityDecl.exec(valid)[0]).toBe(valid);
		})
	);
});
