'use strict'

const { DOMParser } = require('../../lib/dom-parser')
const { XMLSerializer } = require('../../lib/dom')

describe('XML Serializer', () => {
	it('supports text node containing "]]>"', () => {
		const doc = new DOMParser().parseFromString('<test/>', 'text/xml')
		doc.documentElement.appendChild(doc.createTextNode('hello ]]> there'))
		expect(doc.documentElement.firstChild.toString()).toBe('hello ]]&gt; there')
	})

	it('supports <script> element with no children', () => {
		const doc = new DOMParser({
			xmlns: { xmlns: 'http://www.w3.org/1999/xhtml' },
		}).parseFromString('<html2><script></script></html2>', 'text/html')
		expect(doc.documentElement.firstChild.toString()).toBe(
			'<script xmlns="http://www.w3.org/1999/xhtml"></script>'
		)
	})
	describe('properly escapes attribute values', () => {
		it('should escape special characters in namespace attributes', () => {
			const input = `<xml xmlns='<&"' xmlns:attr='"&<'><test attr:test=""/></xml>`
			const doc = new DOMParser().parseFromString(input, 'text/xml')

			// in this case the explicit attribute nodes are serialized
			expect(new XMLSerializer().serializeToString(doc)).toBe(
				'<xml xmlns="&lt;&amp;&quot;" xmlns:attr="&quot;&amp;&lt;"><test attr:test=""/></xml>'
			)

			// in this case the namespace attributes are "inherited" from the parent,
			// which is not serialized
			expect(
				new XMLSerializer().serializeToString(doc.documentElement.firstChild)
			).toBe(
				'<test xmlns:attr="&quot;&amp;&lt;" attr:test="" xmlns="&lt;&amp;&quot;"/>'
			)
		})
	})
})
