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

			const actual = parser.parseFromString(source, 'text/xml').firstChild;

			expect({
				[idType]: idType === 'SYSTEM' ? actual.systemId : actual.publicId,
				name: actual.name,
				...errors,
			}).toEqual({
				[idType]: idValue,
				name: 'x',
			});
		});
	});

	describe('sets Document.doctype', () => {
		it('should set it for XML documents', () => {
			const { parser } = getTestParser();
			const doc = parser.parseFromString('<!DOCTYPE name><X/>', 'text/xml');

			expect(doc.doctype).toBeTruthy();
			expect(doc.doctype.ownerDocument === doc).toBe(true);
			expect(doc.firstChild === doc.doctype).toBe(true);
			expect(doc.childNodes.length).toBe(2);
		});
		it('should set it for HTML documents', () => {
			const { parser } = getTestParser();
			const doc = parser.parseFromString('<!DOCTYPE html><body></body>', MIME_TYPE.HTML);

			expect(doc.doctype).toBeTruthy();
			expect(doc.doctype.ownerDocument === doc).toBe(true);
			expect(doc.firstChild === doc.doctype).toBe(true);
			expect(doc.childNodes.length).toBe(2);
		});
	});
});
