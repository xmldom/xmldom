const {DOMParser} = require('../lib/dom-parser');

describe('DOMParser', () => {
	describe('constructor', () => {
		test('should store passed options.locator', () => {
			const options = {locator: {}};
			const it = new DOMParser(options);

			// TODO: is there a simpler way to test this that doesn't involve invoking parseFromString?
			it.parseFromString('<xml/>')

			const expected = {
				columnNumber: 1,
				lineNumber: 1,
			};
			expect(options.locator).toEqual(expected);
		})

		test('should store passed options.xmlns for default mime type', () => {
			const options = {xmlns: {'': 'custom-default-ns'}};
			const it = new DOMParser(options);

			// TODO: is there a simpler way to test this that doesn't involve invoking parseFromString?
			const actual = it.parseFromString('<xml/>')

			expect(actual.toString()).toEqual('<xml xmlns="custom-default-ns"/>')
		})

		test('should store and modify passed options.xmlns for html mime type', () => {
			const options = {xmlns: {'': 'custom-default-ns'}};
			const it = new DOMParser(options);

			// TODO: is there a simpler way to test this that doesn't involve invoking parseFromString?
			it.parseFromString('<xml/>', 'text/html')

			expect(options.xmlns['']).toEqual('http://www.w3.org/1999/xhtml')
		})
	})

	describe('parseFromString', () => {
		test('should use minimal entity map for default mime type', () => {
			const XML = '<xml attr="&quot;">&lt; &amp;</xml>'
			expect(
				new DOMParser().parseFromString(XML).toString()
			).toEqual(XML)
		})
	})
})
