'use strict';

const { getTestParser } = require('../get-test-parser');
const { MIME_TYPE } = require('../../lib/conventions');

describe('doctype', () => {
	describe.each(['SYSTEM', 'PUBLIC'])('%s', (idType) => {
		test.each([
			['outer single', `<!DOCTYPE x ${idType} '\"'><X/>`, "'\"'"],
			['outer double', `<!DOCTYPE x ${idType} "\'"><X/>`, '"\'"'],
		])('should parse single line DOCTYPE with mixed quotes (%s)', (_, source, idValue) => {
			const { errors, parser } = getTestParser();

			const actual = parser.parseFromString(source, MIME_TYPE.XML_TEXT).firstChild;

			expect({
				[idType]: idType === 'SYSTEM' ? actual.systemId : actual.publicId,
				name: actual.name,
				...(errors.length ? { errors } : undefined),
			}).toEqual({
				[idType]: idValue,
				name: 'x',
			});
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
		const internalSubset =
			'\n' + '  <!ENTITY foo "foo">\n' + '  <!ENTITY bar "bar">\n' + '  <!ENTITY bar "bar2">\n' + '  <!ENTITY % baz "baz">\n';

		const doctypeString =
			'<?xml version="1.0"><!-- >\'" --><!DOCTYPE name PUBLIC "identifier" "url" [' + internalSubset + ']><name/>';

		const { parser } = getTestParser();
		const doc = parser.parseFromString(doctypeString, MIME_TYPE.XML_TEXT);

		expect(doc.doctype).toBeTruthy();
		expect(doc.doctype.internalSubset).toBe(internalSubset);
	});
});
