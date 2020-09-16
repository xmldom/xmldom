const { DOMParser } = require('../lib/dom-parser')

describe('DOMParser', () => {
	describe('constructor', () => {
		test('should store passed options.locator', () => {
			const options = { locator: {} }
			const it = new DOMParser(options)

			// TODO: is there a simpler way to test this that doesn't involve invoking parseFromString?
			it.parseFromString('<xml/>')

			const expected = {
				columnNumber: 1,
				lineNumber: 1,
			}
			expect(options.locator).toEqual(expected)
		})

		test('should store passed options.xmlns for default mime type', () => {
			const options = { xmlns: { '': 'custom-default-ns' } }
			const it = new DOMParser(options)

			// TODO: is there a simpler way to test this that doesn't involve invoking parseFromString?
			const actual = it.parseFromString('<xml/>')

			expect(actual.toString()).toEqual('<xml xmlns="custom-default-ns"/>')
		})

		test('should store and modify passed options.xmlns for html mime type', () => {
			const options = { xmlns: { '': 'custom-default-ns' } }
			const it = new DOMParser(options)

			// TODO: is there a simpler way to test this that doesn't involve invoking parseFromString?
			it.parseFromString('<xml/>', 'text/html')

			expect(options.xmlns['']).toEqual('http://www.w3.org/1999/xhtml')
		})
	})

	describe('parseFromString', () => {
		test('should use minimal entity map for default mime type', () => {
			const XML = '<xml attr="&quot;">&lt; &amp;</xml>'
			expect(new DOMParser().parseFromString(XML).toString()).toEqual(XML)
		})

		test('should provide access to textContent and attribute values', () => {
			// provides an executable example for https://github.com/xmldom/xmldom/issues/93
			const XML = `
			<pdf2xml producer="poppler" version="0.26.5">
				<page number="1" position="absolute" top="0" left="0" height="1262" width="892">
					<fontspec id="0" size="14" family="Times" color="#000000"/>
					<text top="0" >first</text>
					<text top="1" >second</text>
					<text top="2" >last</text>
				</page>
			</pdf2xml>
`
			/*
			 TODO: again this is the "simples and most readable way,
			  but it also means testing it over and over
			*/
			const document = new DOMParser().parseFromString(XML)
			/*
			 FIXME: from here we are actually testing the Document/Element/Node API
			 maybe this should be split?
			*/
			const textTags = document.getElementsByTagName('text')

			expect(textTags.length).toEqual(3)
			const expectedText = ['first', 'second', 'last']
			for (let i = 0; i < textTags.length; i++) {
				const textTag = textTags[i]
				expect(textTag.textContent).toEqual(expectedText[i])
				expect(textTag.getAttribute('top')).toEqual(`${i}`)
			}
		})
	})
})
