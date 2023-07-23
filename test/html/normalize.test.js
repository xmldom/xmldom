'use strict';

const { describe, expect, test } = require('@jest/globals');
const { MIME_TYPE } = require('../../lib/conventions');
const { getTestParser } = require('../get-test-parser');

describe('html normalizer', () => {
	test.each([
		'<div>&amp;&lt;123&456<789;&&</div>',
		'<div><123e>&<a<br/></div>',
		'<div>&nbsp;&copy;&nbsp&copy</div>',
		'<html xmlns:x="1"><body/></html>',
		'<html test="a<b && a>b && \'&amp;&&\'"/>',
		'<div test="alert(\'<br/>\')"/>',
		'<div test="a<b&&a< c && a>d"></div>',
		'<div a=& bb c d=123&&456/>',
		'<html test="123"/>',
		'<Label onClick=doClick..">Hello, World</Label>',
	])('%s', (xml) => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString(xml, 'text/html').toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});

	test.each([
		'<html><meta><link><img><br><hr><input></html>',
		'<html title =1/2></html>',
		'<html title= 1/>',
		'<html title = 1/>',
		'<html title/>',
	])('unclosed html %s', (xml) => {
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString(xml, MIME_TYPE.HTML).toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});

	Array.from([MIME_TYPE.XML_TEXT, MIME_TYPE.HTML]).forEach((mimeType) => {
		test.each([
			'<script>alert(a<b&&c?"<br>":">>");</script>',
			'<script>alert(a<b&&c?"<br/>":">>");</script>',
			'<script src="./test.js"/>',
			'<textarea>alert(a<b&&c?"<br>":">>");</textarea>',
			'<input type="button" disabled></input>',
			'<input type="checkbox" checked></input>',
			'<option selected></option>',
			'<ul><li>abc<li>def</ul>',
		])(`${mimeType}: script %s`, (xml) => {
			const { errors, parser } = getTestParser();

			try {
				const actual = parser.parseFromString(xml, mimeType).toString();

				expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot('reported');
			} catch (error) {
				expect(error).toMatchSnapshot('caught');
			}
		});
	});

	test.each([
		`<html xmlns="http://www.w3.org/1999/xhtml"><script>let message = " &amp; ETH";</script></html>`,
		`<html><script>let message = " &amp; ETH";</script></html>`,
	])(`should map entity in %s`, (xml) => {
		const { parser } = getTestParser();

		const actual = parser.parseFromString(xml, 'application/xml');

		expect(actual.documentElement.firstChild.textContent).toBe('let message = " & ETH";');
	});
	test.each([
		`<html xmlns="http://www.w3.org/1999/xhtml"><script>let message = " &amp; ETH";</script></html>`,
		`<html><script>let message = " &amp; ETH";</script></html>`,
	])(`should not map entity in %s`, (xml) => {
		const { parser } = getTestParser();

		const actual = parser.parseFromString(xml, 'text/html');

		expect(actual.documentElement.firstChild.textContent).toBe('let message = " &amp; ETH";');
	});

	test('European entities', () => {
		const { errors, parser } = getTestParser();

		const actual = parser
			.parseFromString(
				'<div>&Auml;&auml;&Aring;&aring;&AElig;&aelig;&Ouml;&ouml;&Oslash;&oslash;&szlig;&Uuml;&uuml;&euro;</div>',
				'text/html'
			)
			.toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchObject({
			// For the future, it may be nicer to use \uxxxx in the assert strings
			// rather than pasting in multi-byte UTF-8 Unicode characters
			actual: '<div xmlns="http://www.w3.org/1999/xhtml">ÄäÅåÆæÖöØøßÜü€</div>',
		});
	});
	test('European entities xml', () => {
		const { errors, parser } = getTestParser();

		const actual = parser
			.parseFromString(
				'<div>&Auml;&auml;&Aring;&aring;&AElig;&aelig;&Ouml;&ouml;&Oslash;&oslash;&szlig;&Uuml;&uuml;&euro;</div>',
				MIME_TYPE.XML_TEXT
			)
			.toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchObject({
			// For the future, it may be nicer to use \uxxxx in the assert strings
			// rather than pasting in multi-byte UTF-8 Unicode characters
			actual:
				'<div>&amp;Auml;&amp;auml;&amp;Aring;&amp;aring;&amp;AElig;&amp;aelig;&amp;Ouml;&amp;ouml;&amp;Oslash;&amp;oslash;&amp;szlig;&amp;Uuml;&amp;uuml;&amp;euro;</div>',
		});
	});
});
