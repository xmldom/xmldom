'use strict';

const { describe, expect, test } = require('@jest/globals');
const { ExternalID, PubidLiteral, S, SystemLiteral, reg } = require('../../lib/grammar');
const { range } = require('./utils');

describe('SystemLiteral', () => {
	[
		'""',
		"''",
		"'\"'",
		'"\'"',
		`"${S.chars}!${range('#', '\xFF')}"`,
		`'${range('!', '&')}${range('(', '\xFF')}${S.chars}'`,
	].forEach((valid) =>
		test(`should match ${valid}`, () => {
			expect(SystemLiteral.exec(valid)[0]).toBe(valid);
		})
	);
	['', '"""', "'''"].forEach((invalid) =>
		test(`should match ${invalid}`, () => {
			expect(reg('^', SystemLiteral, '$').test(invalid)).toBe(false);
		})
	);
});

describe('PubidLiteral', () => {
	['""', "''", '"\'"', `"\x20\x0D\x0Aa-zA-Z0-9-'()+,./:=?;!*#@$_%"`, `'\x20\x0D\x0Aa-zA-Z0-9-()+,./:=?;!*#@$_%'`].forEach(
		(valid) =>
			test(`should match ${valid}`, () => {
				expect(PubidLiteral.exec(valid)[0]).toBe(valid);
			})
	);
	['', '"""', "'\"'", "'''"].forEach((invalid) =>
		test(`should match ${invalid}`, () => {
			expect(reg('^', PubidLiteral, '$').test(invalid)).toBe(false);
		})
	);
});

describe('ExternalID', () => {
	test('should contain SystemLiteral twice', () => {
		expect(ExternalID.source.split(SystemLiteral.source)).toHaveLength(3);
	});
	test('should contain PubidLiteral once', () => {
		expect(ExternalID.source.split(PubidLiteral.source)).toHaveLength(2);
	});
	describe('SYSTEM', () => {
		[`SYSTEM ""`, `SYSTEM ''`, `SYSTEM "'"`, `SYSTEM '"'`].forEach((valid) =>
			test(`should match ${valid}`, () => {
				expect(ExternalID.exec(valid)[0]).toBe(valid);
			})
		);
		['', 'SYSTEM'].forEach((invalid) =>
			test(`should match ${invalid}`, () => {
				expect(reg('^', ExternalID, '$').test(invalid)).toBe(false);
			})
		);
	});
	describe('PUBLIC', () => {
		[
			`PUBLIC "" ""`,
			`PUBLIC '' ""`,
			`PUBLIC "" ''`,
			`PUBLIC '' ''`,
			`PUBLIC "'" "'"`,
			`PUBLIC '' "'"`,
			`PUBLIC "'" '"'`,
			`PUBLIC '' '"'`,
			`PUBLIC "\x20\x0D\x0Aa-zA-Z0-9-()+,./:=?;!*#@$_%" '"'`,
			`PUBLIC '\x20\x0D\x0Aa-zA-Z0-9-()+,./:=?;!*#@$_%' '"'`,
		].forEach((valid) =>
			test(`should match ${valid}`, () => {
				expect(ExternalID.exec(valid)[0]).toBe(valid);
			})
		);
		['', 'PUBLIC', `PUBLIC ''`, `PUBLIC ""`, `PUBLIC '"' ''`].forEach((invalid) =>
			test(`should match ${invalid}`, () => {
				expect(reg('^', ExternalID, '$').test(invalid)).toBe(false);
			})
		);
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
