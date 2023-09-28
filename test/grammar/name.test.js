'use strict';

const { describe, expect, test } = require('@jest/globals');
const { Name, QName, QName_exact, QName_group, PEReference } = require('../../lib/grammar');
const { unicode } = require('./utils');

const NAME_START_CHARS = [
	':',
	'_',
	'a',
	'z',
	'A',
	'Z',
	'\xC0',
	'\xD6',
	'\xD8',
	'\xF6',
	'\u00F8',
	'\u02FF',
	'\u0370',
	'\u037D',
	'\u037F',
	'\u1FFF',
	'\u200C',
	'\u200D',
	'\u2070',
	'\u218F',
	'\u2C00',
	'\u2FEF',
	'\u3001',
	'\uD7FF',
	'\uF900',
	'\uFDCF',
	'\uFDF0',
	'\uFFFD',
	'\u{10000}',
	'\u{10FFFF}',
];

const NAME_CHAR_ADDITIONS = ['-', '.', '0', '9', '\xB7', '\u0300', '\u036F', '\u203F', '\u2040'];
describe('Name', () => {
	test('should contain NameStartChar characters in second part', () => {
		const endOfFirstCharacterClass = Name.source.indexOf(']');
		const chars = Name.source.substring(1, endOfFirstCharacterClass);
		expect(Name.source.lastIndexOf(chars)).toBeGreaterThan(chars.length);
	});
	NAME_START_CHARS.forEach((valid) =>
		test(`should match a single NameStartChar ${unicode(valid)}`, () => {
			expect(Name.exec(valid)[0]).toBe(valid);
		})
	);
	[...NAME_CHAR_ADDITIONS.map((nameChar, index) => `${NAME_START_CHARS[index]}${nameChar}`), 'a0123456789'].forEach((valid) =>
		test(`should match a single NameStartChar followed by a NameChar(s) "${unicode(valid)}"`, () => {
			expect(Name.exec(valid)[0]).toBe(valid);
		})
	);
	NAME_CHAR_ADDITIONS.forEach((invalid) =>
		test(`should not match single NameChar addition ${unicode(invalid)}`, () => {
			expect(Name.test(invalid)).toBe(false);
		})
	);
	[
		'\xBF',
		'\xD7',
		'\xF7',
		'\u0300',
		'\u0369',
		'\u2000',
		'\u2069',
		'\u2190',
		'\u2BFF',
		'\u2FF0',
		'\u3000',
		'\uD800',
		'\uF8FF',
		'\uFDD0',
		'\uFDDF',
		'\uFFFF',
	].forEach((invalid) =>
		test(`should not match single excluded NameStartChar ${unicode(invalid)}`, () => {
			expect(Name.test(invalid)).toBe(false);
		})
	);
});

const QNAME_START_CHARS = NAME_START_CHARS.filter((char) => char !== ':');
describe('QName', () => {
	test('should contain NameStartChar characters without ":" 4 times', () => {
		const endOfFirstCharacterClass = Name.source.indexOf(']');
		const start = Name.source.indexOf(':') + 1;
		const chars = Name.source.substring(start, endOfFirstCharacterClass);

		expect(QName.source.split(chars)).toHaveLength(5);
	});
	QNAME_START_CHARS.forEach((valid) =>
		test(`should match a single NCNameStartChar ${unicode(valid)}`, () => {
			expect(QName.exec(valid)[0]).toBe(valid);
		})
	);
	[...NAME_CHAR_ADDITIONS.map((nameChar, index) => `${QNAME_START_CHARS[index]}${nameChar}`), 'a0123456789'].forEach((valid) =>
		test(`should match a single NCNameStartChar followed by NCNameChar(s) ${unicode(valid)}`, () => {
			expect(QName.exec(valid)[0]).toBe(valid);
		})
	);
	[
		...NAME_CHAR_ADDITIONS.map(
			(nameChar, index) => `${QNAME_START_CHARS[index]}${nameChar}:${QNAME_START_CHARS[index]}${nameChar}`
		),
		'a0123456789:a0123456789',
	].forEach((valid) =>
		test(`should match a single NCNameStartChar NCNameChar(s) ':' NCNameStartChar NCNameChar(s) ${unicode(valid)}`, () => {
			expect(QName.exec(valid)[0]).toBe(valid);
			expect(QName_exact.test(valid)).toBe(true);
			expect(QName_group.exec(valid)).toMatchSnapshot();
		})
	);
	NAME_CHAR_ADDITIONS.forEach((invalid) =>
		test(`should not match single NameChar addition ${unicode(invalid)}`, () => {
			expect(QName.test(invalid)).toBe(false);
		})
	);
	[':', '::', 'a:', ':a', 'a:b:', `${QNAME_START_CHARS[0]}:${NAME_CHAR_ADDITIONS[0]}`].forEach((invalid) =>
		test(`should not match ${unicode(invalid)}`, () => {
			expect(QName_exact.test(invalid)).toBe(false);
			expect(QName_exact.test(invalid)).toBe(false);
		})
	);
});

describe('PEReference', () => {
	test('should use Name', () => {
		const splitByName = PEReference.source.split(Name.source);
		expect(splitByName).toEqual(['%', ';']);
	});
});
