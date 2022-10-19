'use strict';

const { DOMParser, XMLSerializer } = require('../../lib');
const { MIME_TYPE } = require('../../lib/conventions');

describe('XML Serializer', () => {
	it('supports text node containing "]]>"', () => {
		const doc = new DOMParser().parseFromString('<test/>', 'text/xml');
		doc.documentElement.appendChild(doc.createTextNode('hello ]]> there'));
		expect(doc.documentElement.firstChild.toString()).toBe('hello ]]&gt; there');
	});

	it('supports <script> element with no children', () => {
		const doc = new DOMParser({
			xmlns: { xmlns: 'http://www.w3.org/1999/xhtml' },
		}).parseFromString('<html2><script></script></html2>', 'text/html');
		expect(doc.documentElement.firstChild.toString()).toBe('<script xmlns="http://www.w3.org/1999/xhtml"></script>');
	});

	describe('does not serialize namespaces with an empty URI', () => {
		// for more details see the comments in lib/dom.js:needNamespaceDefine
		it('that are used in a node', () => {
			const source = '<w:p><w:r>test1</w:r><w:r>test2</w:r></w:p>';
			const { documentElement } = new DOMParser().parseFromString(source);

			expect(documentElement.firstChild.firstChild).toMatchObject({
				nodeValue: 'test1',
			});
			expect(documentElement.lastChild.firstChild).toMatchObject({
				nodeValue: 'test2',
			});

			expect(documentElement.toString()).toStrictEqual(source);
		});

		it('that are used in an attribute', () => {
			const source = '<w:p w:attr="val"/>';
			const { documentElement } = new DOMParser().parseFromString(source);

			expect(documentElement.toString()).toStrictEqual(source);
		});
	});

	describe('does detect matching visible namespace for tags without prefix', () => {
		it('should add local namespace after sibling', () => {
			const str = '<a:foo xmlns:a="AAA"><bar xmlns="AAA"/></a:foo>';
			const doc = new DOMParser().parseFromString(str, MIME_TYPE.XML_TEXT);

			const child = doc.createElementNS('AAA', 'child');
			expect(new XMLSerializer().serializeToString(child)).toBe('<child xmlns="AAA"/>');
			doc.documentElement.appendChild(child);
			expect(new XMLSerializer().serializeToString(doc)).toBe('<a:foo xmlns:a="AAA"><bar xmlns="AAA"/><a:child/></a:foo>');
		});
		it('should add local namespace from parent', () => {
			const str = '<a:foo xmlns:a="AAA"/>';
			const doc = new DOMParser().parseFromString(str, MIME_TYPE.XML_TEXT);

			const child = doc.createElementNS('AAA', 'child');
			expect(new XMLSerializer().serializeToString(child)).toBe('<child xmlns="AAA"/>');
			doc.documentElement.appendChild(child);
			expect(new XMLSerializer().serializeToString(doc)).toBe('<a:foo xmlns:a="AAA"><a:child/></a:foo>');
			const nested = doc.createElementNS('AAA', 'nested');
			expect(new XMLSerializer().serializeToString(nested)).toBe('<nested xmlns="AAA"/>');
			child.appendChild(nested);
			expect(new XMLSerializer().serializeToString(doc)).toBe('<a:foo xmlns:a="AAA"><a:child><a:nested/></a:child></a:foo>');
		});
		it('should add local namespace as xmlns in HTML', () => {
			const str = '<a:foo xmlns:a="AAA"/>';
			const doc = new DOMParser().parseFromString(str, MIME_TYPE.HTML);

			const child = doc.createElementNS('AAA', 'child');
			expect(new XMLSerializer().serializeToString(child)).toBe('<child xmlns="AAA"></child>');
			doc.documentElement.appendChild(child);
			expect(new XMLSerializer().serializeToString(doc)).toBe('<a:foo xmlns:a="AAA"><child xmlns="AAA"></child></a:foo>');
			const nested = doc.createElementNS('AAA', 'nested');
			expect(new XMLSerializer().serializeToString(nested)).toBe('<nested xmlns="AAA"></nested>');
			child.appendChild(nested);
			expect(new XMLSerializer().serializeToString(doc)).toBe(
				'<a:foo xmlns:a="AAA"><child xmlns="AAA"><nested></nested></child></a:foo>'
			);
		});
		it('should add keep different default namespace of child', () => {
			const str = '<a:foo xmlns:a="AAA"/>';
			const doc = new DOMParser().parseFromString(str, MIME_TYPE.XML_TEXT);

			const child = doc.createElementNS('BBB', 'child');
			child.setAttribute('xmlns', 'BBB');
			expect(new XMLSerializer().serializeToString(child)).toBe('<child xmlns="BBB"/>');
			doc.documentElement.appendChild(child);
			const nested = doc.createElementNS('BBB', 'nested');
			expect(new XMLSerializer().serializeToString(nested)).toBe('<nested xmlns="BBB"/>');
			child.appendChild(nested);
			expect(new XMLSerializer().serializeToString(doc)).toBe(
				'<a:foo xmlns:a="AAA"><child xmlns="BBB"><nested/></child></a:foo>'
			);
		});
	});
	describe('is insensitive to namespace order', () => {
		it('should preserve prefixes for inner elements and attributes', () => {
			const NS = 'http://www.w3.org/test';
			const xml = `
<xml xmlns="${NS}">
	<one attr="first"/>
	<group xmlns:inner="${NS}">
		<two attr="second"/>
		<inner:three inner:attr="second"/>
	</group>
</xml>
`.trim();
			const dom = new DOMParser().parseFromString(xml, 'text/xml');
			const doc = dom.documentElement;
			const one = doc.childNodes.item(1);
			expect(one).toMatchObject({
				localName: 'one',
				nodeName: 'one',
				prefix: null,
				namespaceURI: NS,
			});
			const group = doc.childNodes.item(3);
			expect(group).toMatchObject({
				localName: 'group',
				nodeName: 'group',
				prefix: null,
				namespaceURI: NS,
			});
			const two = group.childNodes.item(1);
			expect(two).toMatchObject({
				localName: 'two',
				nodeName: 'two',
				prefix: null,
				namespaceURI: NS,
			});
			const three = group.childNodes.item(3);
			expect(three).toMatchObject({
				localName: 'three',
				nodeName: 'inner:three',
				prefix: 'inner',
				namespaceURI: NS,
			});
			expect(new XMLSerializer().serializeToString(dom)).toEqual(xml);
		});
		it('should preserve missing prefixes for inner prefixed elements and attributes', () => {
			const NS = 'http://www.w3.org/test';
			const xml = `
<xml xmlns:inner="${NS}">
	<inner:one attr="first"/>
	<inner:group xmlns="${NS}">
		<inner:two attr="second"/>
		<three attr="second"/>
	</inner:group>
</xml>
`.trim();
			const dom = new DOMParser().parseFromString(xml, 'text/xml');
			const doc = dom.documentElement;
			const one = doc.childNodes.item(1);
			expect(one).toMatchObject({
				localName: 'one',
				nodeName: 'inner:one',
				prefix: 'inner',
				namespaceURI: NS,
			});
			const group = doc.childNodes.item(3);
			expect(group).toMatchObject({
				localName: 'group',
				nodeName: 'inner:group',
				prefix: 'inner',
				namespaceURI: NS,
			});
			const two = group.childNodes.item(1);
			expect(two).toMatchObject({
				localName: 'two',
				nodeName: 'inner:two',
				prefix: 'inner',
				namespaceURI: NS,
			});
			const three = group.childNodes.item(3);
			expect(three).toMatchObject({
				localName: 'three',
				nodeName: 'three',
				prefix: null,
				namespaceURI: NS,
			});
			expect(new XMLSerializer().serializeToString(dom)).toEqual(xml);
		});
		it('should produce unprefixed svg elements when prefixed namespace comes first', () => {
			const svg = `
<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg">
	<g><circle/></g>
</svg>`.trim();
			const dom = new DOMParser().parseFromString(svg, 'text/xml');

			expect(new XMLSerializer().serializeToString(dom)).toEqual(svg);
		});
		it('should produce unprefixed svg elements when default namespace comes first', () => {
			const svg = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
	<g><circle/></g>
</svg>
`.trim();
			const dom = new DOMParser().parseFromString(svg, 'text/xml');

			expect(new XMLSerializer().serializeToString(dom)).toEqual(svg);
		});
	});
	describe('properly escapes attribute values', () => {
		it('should properly convert whitespace literals back to character references', () => {
			const input = '<xml attr="&#9;&#10;&#13;"/>';
			const dom = new DOMParser().parseFromString(input, MIME_TYPE.XML_TEXT);

			expect(new XMLSerializer().serializeToString(dom)).toBe(input);
		});

		it('should escape special characters in namespace attributes', () => {
			const input = `<xml xmlns='<&"' xmlns:attr='"&<'><test attr:test=""/></xml>`;
			const doc = new DOMParser().parseFromString(input, MIME_TYPE.XML_TEXT);

			// in this case the explicit attribute nodes are serialized
			expect(new XMLSerializer().serializeToString(doc)).toBe(
				'<xml xmlns="&lt;&amp;&quot;" xmlns:attr="&quot;&amp;&lt;"><test attr:test=""/></xml>'
			);

			// in this case the namespace attributes are "inherited" from the parent,
			// which is not serialized
			expect(new XMLSerializer().serializeToString(doc.documentElement.firstChild)).toBe(
				'<test xmlns:attr="&quot;&amp;&lt;" attr:test="" xmlns="&lt;&amp;&quot;"/>'
			);
		});
	});
});
