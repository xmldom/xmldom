'use strict';

const { describe, expect, test } = require('@jest/globals');
const { elementdecl, QName, S, PEReference, Name, S_OPT } = require('../../lib/grammar');

describe('elementdecl', () => {
	test('should contain Name twice', () => {
		expect(elementdecl.source.split(Name.source)).toHaveLength(3);
	});
	test('should contain QName twice', () => {
		expect(elementdecl.source.split(QName.source)).toHaveLength(3);
	});
	test('should contain PEReference twice', () => {
		expect(elementdecl.source.split(PEReference.source)).toHaveLength(3);
	});
	test('should contain S twice', () => {
		expect(elementdecl.source.split(S.source)).toHaveLength(3);
	});
	test('should contain S_OPT seven times', () => {
		expect(elementdecl.source.split(S_OPT.source)).toHaveLength(8);
	});
	[
		`<!ELEMENT br EMPTY>`,
		`<!ELEMENT container ANY>`,
		`<!ELEMENT p (#PCDATA)>`,
		`<!ELEMENT p ( #PCDATA ) >`,
		`<!ELEMENT p (#PCDATA)*>`,
		`<!ELEMENT p (#PCDATA|emph)*>`,
		`<!ELEMENT p ( #PCDATA | emph | hpme )* >`,
		`<!ELEMENT %name.para; %content.para; >`,
		`<!ELEMENT spec (front, body, back?)>`,
		`<!ELEMENT div1 (head, (p | list | note)*, div2*)>`,
		`<!ELEMENT dictionary-body (%div.mix; | %dict.mix;)*>`,
		`<!ELEMENT p (#PCDATA|a|ul|b|i|em)*>`,
		`<!ELEMENT p (#PCDATA | %font; | %phrase; | %special; | %form;)* >`,
		`<!ELEMENT book (comments*, title, body, supplements?)>`,
		`<!ELEMENT book (title, body, supplements?)>`,
	].forEach((valid) =>
		test(`should match examples from spec ${valid}`, () => {
			expect(elementdecl.exec(valid)[0]).toBe(valid);
		})
	);
	[`<!ELEMENT\n \r\tName\n \r\tANY\n \r\t>`].forEach((valid) =>
		test('should accept all spaces in all places', () => {
			expect(elementdecl.exec(valid)[0]).toBe(valid);
		})
	);
});
