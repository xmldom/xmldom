'use strict';

const { describe, expect, test } = require('@jest/globals');
const { Name, ExternalID, SystemLiteral } = require('../../lib/grammar');

describe('doctypedecl', () => {
	test('should match parts', () => {
		expect(Name.test('name')).toBe(true);
		expect(SystemLiteral.test('""')).toBe(true);
		expect(SystemLiteral.test("''")).toBe(true);
		expect(ExternalID.test(`PUBLIC '' ''`)).toBe(true);
		expect(ExternalID.test(`SYSTEM ''`)).toBe(true);
		expect(ExternalID.test(`SYSTEM ""`)).toBe(true);
		expect(ExternalID.test(`SYSTEM "hello.dtd"`)).toBe(true);
	});
	/*
	[
		`<!DOCTYPE name PUBLIC "identifier"  "url" [
		<?foo "foo"?>
		<!ENTITY bar "bar">
		<!ENTITY bar "bar2"> <!--  -->
		<!ENTITY % baz "baz"> %test;
		]>`,
		`<!DOCTYPE name>`,
		`<!DOCTYPE name SYSTEM "identifier" [
		  <!ENTITY foo "foo">
		  <!ENTITY bar "bar">
		  <!ENTITY bar "bar2"> <!--  -->
		  <!ENTITY % baz "baz"> %test;
		]>`,
		`<!DOCTYPE name [
		 <!ELEMENT br EMPTY>
		 <!ELEMENT p (#PCDATA|emph)* >
		 <!ELEMENT container ANY>
		 <!ELEMENT %name.para; %content.para; >
		 ]>`,
		`<!DOCTYPE HTML >`,
		`<!DOCTYPE greeting SYSTEM "hello.dtd">`,
		`<!DOCTYPE name PUBLIC '' ''>`,
		`<!DOCTYPE name SYSTEM 'test' []  >`,
		`<!DOCTYPE name PUBLIC 'test' 'test2'>`,
		`<!DOCTYPE name PUBLIC 'test' "tes't2">`,
	].forEach((source, index) =>
		//? source
		test(`should match valid doctype at index ${index}`, () => {
			expect(doctypedecl.test(source)).toBe(true);
		})
	);
	[
		`<!DOCTYPE x PUBLIC '"'>`,
		`<!DOCTYPE SYSTEM "bla">`,
		`<!DOCTYPE name [%;]>`,
		`<!DOCTYPE name SYSTEM 'test' 'test2'>`,
		`<!DOCTYPE name PUBLIC 'te'st' 'test2'>`,
		`<!DOCTYPE name PUBLIC 'test' 'tes't2'>`,
		`<!DOCTYPE name PUBLIC 'test' "tes"t2">`,
	].forEach((source, index) =>
		//? source
		test(`should not match invalid doctype at index ${index}`, () => {
			expect(doctypedecl.test(source)).toBe(false);
		})
	);
*/
});
