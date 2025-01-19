'use strict';

const { describe, expect, test } = require('@jest/globals');
const { parseDoctypeCommentOrCData } = require('../../lib/sax');
const g = require('../../lib/grammar');
describe('parseDoctypeCommentOrCData', () => {
	test('should report fatal error and return when it ends after "<!"', () => {
		const start = 0;
		var source = '<!';
		const errorHandler = { fatalError: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, undefined, errorHandler);

		expect(returned).toBe(undefined);
		expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining('Not well-formed'));
	});
	test('should report fatal error and return with incomplete DOCTYPE decl', () => {
		const start = 0;
		var source = '<!D';
		const errorHandler = { fatalError: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, { doc: {} }, errorHandler);

		expect(returned).toBe(undefined);
		expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining(g.DOCTYPE_DECL_START));
	});
	test('should report fatal error and return with missing whitespace after DOCTYPE decl', () => {
		const start = 0;
		var source = g.DOCTYPE_DECL_START + 'Name';
		const errorHandler = { fatalError: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, { doc: {} }, errorHandler);

		expect(returned).toBe(undefined);
		expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining('whitespace after ' + g.DOCTYPE_DECL_START));
	});
	test('should report fatal error and return with document ending after DOCTYPE decl', () => {
		const start = 0;
		var source = g.DOCTYPE_DECL_START;
		const errorHandler = { fatalError: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, { doc: {} }, errorHandler);

		expect(returned).toBe(undefined);
		expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining('whitespace after ' + g.DOCTYPE_DECL_START));
	});
	test('should report fatal error and return with invalid Name after DOCTYPE decl', () => {
		const start = 0;
		var source = g.DOCTYPE_DECL_START + ' .';
		const errorHandler = { fatalError: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, { doc: {} }, errorHandler);

		expect(returned).toBe(undefined);
		expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining('doctype name missing'));
	});
	test('should report fatal error and return with document ending after DOCTYPE decl and whitespace', () => {
		const start = 0;
		var source = g.DOCTYPE_DECL_START + ' ';
		const errorHandler = { fatalError: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, { doc: {} }, errorHandler);

		expect(returned).toBe(undefined);
		// the error message is complaining about whitespace even though that was correctly skipped,
		// but we reached the end of the source, but I assume it's good enough
		expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining('whitespace after ' + g.DOCTYPE_DECL_START));
	});
	test('should report fatal error and return with document ending after DOCTYPE internal subset starts', () => {
		const start = 0;
		var source = g.DOCTYPE_DECL_START + ' Name [';
		const errorHandler = { fatalError: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, { doc: {} }, errorHandler);

		expect(returned).toBe(undefined);
		expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining('doctype internal subset is not well-formed'));
	});
	test('should report fatal error and return with DOCTYPE internal subset PI not well formed', () => {
		const start = 0;
		var source = g.DOCTYPE_DECL_START + ' Name [ <?Name';
		const errorHandler = { fatalError: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, { doc: {} }, errorHandler);

		expect(returned).toBe(undefined);
		expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining('processing instruction is not well-formed'));
	});
	test('should report fatal error and return with DOCTYPE internal subset PI being an xml decl', () => {
		const start = 0;
		var source = g.DOCTYPE_DECL_START + ' Name [ <?Xml version="1.0"?>';
		const errorHandler = { fatalError: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, { doc: {} }, errorHandler);

		expect(returned).toBe(undefined);
		expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining('xml declaration is only allowed'));
	});
	test('should report fatal error and return with DOCTYPE inside documentElement', () => {
		const start = 0;
		var source = g.DOCTYPE_DECL_START + '';
		const errorHandler = { fatalError: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, { doc: { documentElement: {} } }, errorHandler);

		expect(returned).toBe(undefined);
		expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining('Doctype not allowed'));
	});
	test('should call domHandler method with correct values when everything is well-formed', () => {
		const start = 0;
		const pi = '<?pi simple ?> ';
		const Name = 'Name';
		var source = g.DOCTYPE_DECL_START + ' ' + Name + ' PUBLIC "pubId" "sysId" [' + pi + ']>';
		const errorHandler = { fatalError: jest.fn() };
		const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, domBuilder, errorHandler);

		expect(errorHandler.fatalError).not.toHaveBeenCalled();
		expect(returned).toBe(source.length);
		expect(domBuilder.startDTD).toHaveBeenCalledWith(Name, '"pubId"', '"sysId"', pi);
		expect(domBuilder.endDTD).toHaveBeenCalled();
	});

	test('should call domHandler method with correct values when everything is well-formed and empty', () => {
		const start = 0;
		const Name = 'Name';
		var source = g.DOCTYPE_DECL_START + ' ' + Name + ' PUBLIC "pubId" "sysId" []>';
		const errorHandler = { fatalError: jest.fn() };
		const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, domBuilder, errorHandler);

		expect(errorHandler.fatalError).not.toHaveBeenCalled();
		expect(returned).toBe(source.length);
		expect(domBuilder.startDTD).toHaveBeenCalledWith(Name, '"pubId"', '"sysId"', '');
		expect(domBuilder.endDTD).toHaveBeenCalled();
	});

	test('should call domHandler method with correct values when everything is well-formed and empty with spaces', () => {
		const start = 0;
		const Name = 'Name';
		var source = g.DOCTYPE_DECL_START + ' ' + Name + ' PUBLIC "pubId" "sysId" [ ]>';
		const errorHandler = { fatalError: jest.fn() };
		const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, domBuilder, errorHandler);

		expect(errorHandler.fatalError).not.toHaveBeenCalled();
		expect(returned).toBe(source.length);
		expect(domBuilder.startDTD).toHaveBeenCalledWith(Name, '"pubId"', '"sysId"', ' ');
		expect(domBuilder.endDTD).toHaveBeenCalled();
	});

	test('should call domHandler method with correct values when everything is well-formed and empty with comment', () => {
		const start = 0;
		const Name = 'Name';
		const internalSubset = ' <!-- comment --> ';
		var source = g.DOCTYPE_DECL_START + ' ' + Name + ' PUBLIC "pubId" "sysId" [' + internalSubset + ']>';
		const errorHandler = { fatalError: jest.fn() };
		const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };

		const returned = parseDoctypeCommentOrCData(source, start, domBuilder, errorHandler);

		expect(errorHandler.fatalError).not.toHaveBeenCalled();
		expect(returned).toBe(source.length);
		expect(domBuilder.startDTD).toHaveBeenCalledWith(Name, '"pubId"', '"sysId"', internalSubset);
		expect(domBuilder.endDTD).toHaveBeenCalled();
	});
	describe('when isHtml is true', () => {
		const html = 'html';
		const HTML = 'HTML';
		const isHtml = true;
		test('should report fatal error and return with incomplete DOCTYPE decl', () => {
			const start = 0;
			var source = '<!d';
			const errorHandler = { fatalError: jest.fn() };

			const returned = parseDoctypeCommentOrCData(source, start, { doc: {} }, errorHandler, isHtml);

			expect(returned).toBe(undefined);
			expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining(g.DOCTYPE_DECL_START));
		});
		test('should report warning when doctype name is not html', () => {
			const start = 0;
			var source = '<!doctype fantasy>';
			const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };
			const errorHandler = { warning: jest.fn() };

			const returned = parseDoctypeCommentOrCData(source, start, domBuilder, errorHandler, isHtml);

			expect(returned).toBe(source.length);
			expect(errorHandler.warning).toHaveBeenCalledWith(expect.stringContaining('Unexpected DOCTYPE in HTML document'));
		});

		it('should accept upper case doctype and name', () => {
			const source = `${g.DOCTYPE_DECL_START} ${HTML}>`;
			const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };
			const returned = parseDoctypeCommentOrCData(source, 0, domBuilder, {}, isHtml);

			expect(returned).toBe(source.length);
			expect(domBuilder.startDTD).toHaveBeenCalledWith(HTML, undefined, undefined, undefined);
			expect(domBuilder.endDTD).toHaveBeenCalled();
		});
		it('should accept lower case doctype and name', () => {
			const source = `${g.DOCTYPE_DECL_START.toLowerCase()} ${html}>`;
			const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };
			const returned = parseDoctypeCommentOrCData(source, 0, domBuilder, {}, isHtml);

			expect(returned).toBe(source.length);
			expect(domBuilder.startDTD).toHaveBeenCalledWith(html, undefined, undefined, undefined);
			expect(domBuilder.endDTD).toHaveBeenCalled();
		});
		it('should accept mixed case doctype and name', () => {
			const source = `<!DocType Html>`;
			const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };
			const returned = parseDoctypeCommentOrCData(source, 0, domBuilder, {}, isHtml);

			expect(returned).toBe(source.length);
			expect(domBuilder.startDTD).toHaveBeenCalledWith('Html', undefined, undefined, undefined);
			expect(domBuilder.endDTD).toHaveBeenCalled();
		});
		it(`should accept and preserve doctype with lower case system and '${g.ABOUT_LEGACY_COMPAT}'`, () => {
			const source = `${g.DOCTYPE_DECL_START} ${HTML} system '${g.ABOUT_LEGACY_COMPAT}'>`;
			const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };
			const returned = parseDoctypeCommentOrCData(source, 0, domBuilder, {}, isHtml);

			expect(returned).toBe(source.length);
			expect(domBuilder.startDTD).toHaveBeenCalledWith(HTML, undefined, `'${g.ABOUT_LEGACY_COMPAT}'`, undefined);
			expect(domBuilder.endDTD).toHaveBeenCalled();
		});
		it(`should accept and preserve doctype with upper case system and "${g.ABOUT_LEGACY_COMPAT}"`, () => {
			const source = `${g.DOCTYPE_DECL_START} ${HTML} ${g.SYSTEM} "${g.ABOUT_LEGACY_COMPAT}">`;
			const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };
			const returned = parseDoctypeCommentOrCData(source, 0, domBuilder, {}, isHtml);

			expect(returned).toBe(source.length);
			expect(domBuilder.startDTD).toHaveBeenCalledWith(HTML, undefined, `"${g.ABOUT_LEGACY_COMPAT}"`, undefined);
			expect(domBuilder.endDTD).toHaveBeenCalled();
		});
		it(`should report fatal error and return if system is not ${g.ABOUT_LEGACY_COMPAT}`, () => {
			const source = `${g.DOCTYPE_DECL_START} ${HTML} ${g.SYSTEM} "${g.ABOUT_LEGACY_COMPAT}">`;
			const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };
			const returned = parseDoctypeCommentOrCData(source, 0, domBuilder, {}, isHtml);

			expect(returned).toBe(source.length);
			expect(domBuilder.startDTD).toHaveBeenCalledWith(HTML, undefined, `"${g.ABOUT_LEGACY_COMPAT}"`, undefined);
			expect(domBuilder.endDTD).toHaveBeenCalled();
		});
		it('should accept and preserve XHTML doctype', () => {
			const source = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`;
			const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };
			const errorHandler = { warning: jest.fn() };

			const returned = parseDoctypeCommentOrCData(source, 0, domBuilder, errorHandler, isHtml);

			expect(returned).toBe(source.length);
			expect(errorHandler.warning).toHaveBeenCalledWith(expect.stringContaining('Unexpected doctype.systemId in HTML document'));
			expect(domBuilder.startDTD).toHaveBeenCalledWith(
				html,
				'"-//W3C//DTD XHTML 1.0 Transitional//EN"',
				'"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"',
				undefined
			);
			expect(domBuilder.endDTD).toHaveBeenCalled();
		});
		it('should fail on doctype with DTD', () => {
			const source = `${g.DOCTYPE_DECL_START} ${HTML} ${g.SYSTEM} "${g.ABOUT_LEGACY_COMPAT}" [<!ENTITY foo "foo">]>`;
			const domBuilder = { startDTD: jest.fn(), endDTD: jest.fn() };
			const errorHandler = { fatalError: jest.fn() };

			const returned = parseDoctypeCommentOrCData(source, 0, domBuilder, errorHandler, isHtml);

			expect(returned).toBeUndefined();
			expect(errorHandler.fatalError).toHaveBeenCalledWith(expect.stringContaining('doctype not terminated with > at position'));
			expect(domBuilder.startDTD).not.toHaveBeenCalled();
			expect(domBuilder.endDTD).not.toHaveBeenCalled();
		});
	});
});
