'use strict';

const { describe, expect, test } = require('@jest/globals');
const { ExternalID, PubidLiteral, S, SystemLiteral, reg, NotationDecl, Name } = require('../../lib/grammar');
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
		test(`should not match ${invalid}`, () => {
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
		test(`should not match ${invalid}`, () => {
			expect(reg('^', PubidLiteral, '$').test(invalid)).toBe(false);
		})
	);
});

const VALID_SYSTEM = [`SYSTEM ""`, `SYSTEM ''`, `SYSTEM "'"`, `SYSTEM '"'`];
const VALID_PUBLIC_DOUBLE = [
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
];
describe('ExternalID', () => {
	test('should contain SystemLiteral twice', () => {
		expect(ExternalID.source.split(SystemLiteral.source)).toHaveLength(3);
	});
	test('should contain PubidLiteral once', () => {
		expect(ExternalID.source.split(PubidLiteral.source)).toHaveLength(2);
	});
	describe('SYSTEM', () => {
		VALID_SYSTEM.forEach((valid) =>
			test(`should match ${valid}`, () => {
				expect(ExternalID.exec(valid)[0]).toBe(valid);
			})
		);
		['', 'SYSTEM'].forEach((invalid) =>
			test(`should not match ${invalid}`, () => {
				expect(reg('^', ExternalID, '$').test(invalid)).toBe(false);
			})
		);
	});
	describe('PUBLIC', () => {
		VALID_PUBLIC_DOUBLE.forEach((valid) =>
			test(`should match ${valid}`, () => {
				expect(ExternalID.exec(valid)[0]).toBe(valid);
			})
		);
		['', 'PUBLIC', `PUBLIC ''`, `PUBLIC ""`, `PUBLIC '"' ''`].forEach((invalid) =>
			test(`should not match ${invalid}`, () => {
				expect(reg('^', ExternalID, '$').test(invalid)).toBe(false);
			})
		);
	});
});

describe('NotationDecl', () => {
	test('should contain S Name S once', () => {
		expect(NotationDecl.source.split(reg(S, Name, S).source)).toHaveLength(2);
	});
	test('should contain ExternalID once', () => {
		expect(NotationDecl.source.split(ExternalID.source)).toHaveLength(2);
	});
	test('should contain PubidLiteral twice', () => {
		// the first is inside ExternalID
		// the second is in PublicID
		expect(NotationDecl.source.split(PubidLiteral.source)).toHaveLength(3);
	});
	const VALID_PUBLIC_SINGLE = VALID_PUBLIC_DOUBLE.map((pub) => {
		// strip second pair of quotes from pub
		return pub.substring(0, pub.lastIndexOf(' '));
	})
		.filter((pub, i, all) => {
			// remove duplicates (only accepting the first occurrence)
			return all.indexOf(pub) === i;
		})
		.map((pub) => `<!NOTATION Name ${pub}>`);
	test('should have VALID_PUBLIC_SINGLE testcases', () => {
		expect(VALID_PUBLIC_SINGLE).toHaveLength(5);
	});
	[
		...VALID_SYSTEM.map((sys) => `<!NOTATION Name ${sys}>`),
		...VALID_PUBLIC_DOUBLE.map((pub) => `<!NOTATION Name ${pub}>`),
		...VALID_PUBLIC_SINGLE,
	].forEach((valid) =>
		test(`should match ${valid}`, () => {
			expect(NotationDecl.exec(valid)[0]).toBe(valid);
		})
	);
	test('should accept all spaces in all places', () => {
		const source = `<!NOTATION\n \r\tName\n \r\tPUBLIC ""\n \r\t>`;
		expect(NotationDecl.exec(source)[0]).toBe(source);
	});
});
