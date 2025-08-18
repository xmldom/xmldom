'use strict';

const { DOMParser, XMLSerializer, DOMImplementation } = require('../../lib');
const { MIME_TYPE } = require('../../lib/conventions');

describe('XML Serializer', () => {
	test('supports text node containing "]]>"', () => {
		const doc = new DOMParser().parseFromString('<test/>', MIME_TYPE.XML_TEXT);
		doc.documentElement.appendChild(doc.createTextNode('hello ]]> there'));
		expect(doc.documentElement.firstChild.toString()).toBe('hello ]]&gt; there');
	});

	test('supports <script> element with no children', () => {
		const doc = new DOMParser({
			xmlns: { xmlns: 'http://www.w3.org/1999/xhtml' },
		}).parseFromString('<html2><script></script></html2>', 'text/html');
		expect(doc.documentElement.firstChild.toString()).toBe('<script xmlns="http://www.w3.org/1999/xhtml"></script>');
	});

	describe('does not serialize namespaces with an empty URI', () => {
		// for more details see the comments in lib/dom.js:needNamespaceDefine
		test('that are used in a node', () => {
			const source = '<w:p xmlns:w="namespace"><w:r>test1</w:r><w:r>test2</w:r></w:p>';
			const { documentElement } = new DOMParser().parseFromString(source, MIME_TYPE.XML_TEXT);

			expect(documentElement.firstChild.firstChild).toMatchObject({
				nodeValue: 'test1',
			});
			expect(documentElement.lastChild.firstChild).toMatchObject({
				nodeValue: 'test2',
			});

			expect(documentElement.toString()).toStrictEqual(source);
		});

		test('that are used in an attribute', () => {
			const source = '<w:p xmlns:w="namespace" w:attr="val"/>';
			const { documentElement } = new DOMParser().parseFromString(source, MIME_TYPE.XML_TEXT);

			expect(documentElement.toString()).toStrictEqual(source);
		});
	});

	describe('does detect matching visible namespace for tags without prefix', () => {
		test('should add local namespace after sibling', () => {
			const str = '<a:foo xmlns:a="AAA"><bar xmlns="AAA"/></a:foo>';
			const doc = new DOMParser().parseFromString(str, MIME_TYPE.XML_TEXT);

			const child = doc.createElementNS('AAA', 'child');
			expect(new XMLSerializer().serializeToString(child)).toBe('<child xmlns="AAA"/>');
			doc.documentElement.appendChild(child);
			expect(new XMLSerializer().serializeToString(doc)).toBe('<a:foo xmlns:a="AAA"><bar xmlns="AAA"/><a:child/></a:foo>');
		});
		test('should add local namespace from parent', () => {
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
		test('should add local namespace as xmlns in HTML', () => {
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
		test('should add keep different default namespace of child', () => {
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
		test('should preserve prefixes for inner elements and attributes', () => {
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
			const dom = new DOMParser().parseFromString(xml, MIME_TYPE.XML_TEXT);
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
		test('should preserve missing prefixes for inner prefixed elements and attributes', () => {
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
			const dom = new DOMParser().parseFromString(xml, MIME_TYPE.XML_TEXT);
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
		test('should produce unprefixed svg elements when prefixed namespace comes first', () => {
			const svg = `
<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg">
	<g><circle/></g>
</svg>`.trim();
			const dom = new DOMParser().parseFromString(svg, MIME_TYPE.XML_TEXT);

			expect(new XMLSerializer().serializeToString(dom)).toEqual(svg);
		});
		test('should produce unprefixed svg elements when default namespace comes first', () => {
			const svg = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
	<g><circle/></g>
</svg>
`.trim();
			const dom = new DOMParser().parseFromString(svg, MIME_TYPE.XML_TEXT);

			expect(new XMLSerializer().serializeToString(dom)).toEqual(svg);
		});
	});
	describe('properly escapes attribute values', () => {
		test('should properly convert whitespace literals back to character references', () => {
			const input = '<xml attr="&#9;&#10;&#13;"/>';
			const dom = new DOMParser().parseFromString(input, MIME_TYPE.XML_TEXT);

			expect(new XMLSerializer().serializeToString(dom)).toBe(input);
		});

		test('should escape special characters in namespace attributes', () => {
			const input = `<xml xmlns='&lt;&"' xmlns:attr='"&&lt;'><test attr:test=""/></xml>`;
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

	describe('prefix generation', () => {
		test('should generate prefix for attribute in namespace without prefix', () => {
			const doc = new DOMParser().parseFromString('<doc/>', MIME_TYPE.XML_TEXT);
			const element = doc.documentElement;
			element.setAttributeNS('uri:ns', 'name', 'value');
			const result = new XMLSerializer().serializeToString(doc);

			expect(result).toMatch(/^<doc /);
			expect(result).toContain('xmlns:ns1="uri:ns"');
			expect(result).toContain('ns1:name="value"');
		});

		test('should generate sequential prefixes for multiple namespaces', () => {
			const doc = new DOMParser().parseFromString('<doc/>', MIME_TYPE.XML_TEXT);
			const element = doc.documentElement;

			element.setAttributeNS('uri:first', 'attr1', 'value1');
			element.setAttributeNS('uri:second', 'attr2', 'value2');
			element.setAttributeNS('uri:third', 'attr3', 'value3');

			const serialized = new XMLSerializer().serializeToString(doc);
			expect(serialized).toMatch(/^<doc /);
			expect(serialized).toContain('xmlns:ns1="uri:first"');
			expect(serialized).toContain('xmlns:ns2="uri:second"');
			expect(serialized).toContain('xmlns:ns3="uri:third"');
			expect(serialized).toContain('ns1:attr1="value1"');
			expect(serialized).toContain('ns2:attr2="value2"');
			expect(serialized).toContain('ns3:attr3="value3"');
		});

		test('should jump over existing prefixes when generating new ones', () => {
			const doc = new DOMParser().parseFromString('<doc xmlns:ns1="uri:existing"/>', MIME_TYPE.XML_TEXT);
			const element = doc.documentElement;

			// Add an attribute that would normally use ns1 prefix
			element.setAttributeNS('uri:new', 'name', 'value');
			element.setAttributeNS('uri:other', 'ns1:other', 'value');

			const serialized = new XMLSerializer().serializeToString(doc);
			expect(serialized).toContain('xmlns:ns1="uri:existing"');
			expect(serialized).toContain('xmlns:ns2="uri:new"');
			expect(serialized).toContain('ns2:name="value"');
			expect(serialized).toContain('xmlns:ns3="uri:other"');
			expect(serialized).toContain('ns3:other="value"');
		});

		test('should use default namespace for elements instead of generating prefix', () => {
			const doc = new DOMParser().parseFromString('<doc/>', MIME_TYPE.XML_TEXT);
			const child = doc.createElementNS('uri:ns', 'child');
			doc.documentElement.appendChild(child);

			const serialized = new XMLSerializer().serializeToString(doc);
			// Elements without prefix should use default namespace when possible
			expect(serialized).toContain('<child xmlns="uri:ns"/>');
		});

		test('should not generate prefix for attributes in null namespace', () => {
			const doc = new DOMParser().parseFromString('<doc/>', MIME_TYPE.XML_TEXT);
			const element = doc.documentElement;

			element.setAttributeNS('', 'name', 'value');

			expect(new XMLSerializer().serializeToString(doc)).toBe('<doc name="value"/>');
		});

		test('should not generate prefix for xmlns attribute in xmlns namespace', () => {
			const doc = new DOMParser().parseFromString('<doc/>', MIME_TYPE.XML_TEXT);
			const element = doc.documentElement;

			element.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'uri:custom');

			expect(new XMLSerializer().serializeToString(doc)).toBe('<doc xmlns="uri:custom"/>');
		});

		test('should handle mixed default and prefixed namespace declarations', () => {
			const doc = new DOMImplementation().createDocument(null, 'root');
			const el = doc.documentElement;
			el.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'http://default.ns');
			el.setAttributeNS('http://ns1.example.com', 'attr', 'value1');
			el.setAttributeNS('http://ns2.example.com', 'attr', 'value2');

			const serialized = new XMLSerializer().serializeToString(doc);
			expect(serialized).toContain('xmlns="http://default.ns"');
			expect(serialized).toContain('xmlns:ns1="http://ns1.example.com"');
			expect(serialized).toContain('xmlns:ns2="http://ns2.example.com"');
			expect(serialized).toContain('ns1:attr="value1"');
			expect(serialized).toContain('ns2:attr="value2"');
		});

		test('should reuse the generated prefix for subsequent elements', () => {
			const doc = new DOMImplementation().createDocument(null, 'root');
			const el = doc.documentElement;
			el.setAttributeNS('http://ns1.example.com', 'attr1', 'value1');
			el.setAttributeNS('http://ns1.example.com', 'attr2', 'value2');

			// Create a new element in the same namespace
			const child = doc.createElementNS('http://ns1.example.com', 'child');
			el.appendChild(child);

			const serialized = new XMLSerializer().serializeToString(doc);
			expect(serialized).toContain('xmlns:ns1="http://ns1.example.com"');
			expect(serialized).toContain('ns1:attr1="value1"');
			expect(serialized).toContain('ns1:attr2="value2"');
			expect(serialized).toContain('<ns1:child/>');
		});

		test('should handle XML with processing instructions and namespaces', () => {
			const doc = new DOMImplementation().createDocument(null, 'root');
			doc.insertBefore(
				doc.createProcessingInstruction('xml-stylesheet', 'type="text/xsl" href="style.xsl"'),
				doc.documentElement
			);
			const el = doc.documentElement;
			el.setAttributeNS('http://ns1.example.com', 'style', 'value1');
			el.setAttributeNS('http://ns2.example.com', 'style', 'value2');

			const serialized = new XMLSerializer().serializeToString(doc);
			expect(serialized).toContain('<?xml-stylesheet type="text/xsl" href="style.xsl"?>');
			expect(serialized).toContain('xmlns:ns1="http://ns1.example.com"');
			expect(serialized).toContain('xmlns:ns2="http://ns2.example.com"');
			expect(serialized).toContain('ns1:style="value1"');
			expect(serialized).toContain('ns2:style="value2"');
		});

		test('should handle cloning elements across different namespace contexts', () => {
			const doc1 = new DOMImplementation().createDocument('http://ns1.com', 'elem1');
			const doc2 = new DOMImplementation().createDocument('http://ns2.com', 'elem2');
			const el1 = doc1.documentElement;
			el1.setAttributeNS('http://attr.ns', 'test', 'value');
			const el2 = doc2.importNode(el1, true);
			doc2.documentElement.appendChild(el2);

			const serialized = new XMLSerializer().serializeToString(doc2);
			expect(serialized).toMatch(/^<elem2 xmlns="http:\/\/ns2.com">/);
			expect(serialized).toContain('<elem1 ');
			expect(serialized).toContain('xmlns="http://ns1.com"');
			expect(serialized).toContain('ns1:test="value"');
			expect(serialized).toContain('xmlns:ns1="http://attr.ns"');
		});

		test('should not generate prefix if namespace is default', () => {
			const doc = new DOMParser().parseFromString('<parent xmlns="uri:parent"/>', MIME_TYPE.XML_TEXT);
			const child = doc.createElementNS('uri:parent', 'child');
			doc.documentElement.appendChild(child);

			const serialized = new XMLSerializer().serializeToString(doc);
			expect(serialized).toEqual('<parent xmlns="uri:parent"><child/></parent>');
		});

		test('should consider inherited namespace context for prefix decisions', () => {
			const doc = new DOMParser().parseFromString('<root xmlns="uri:default" xmlns:p="uri:prefixed"/>', MIME_TYPE.XML_TEXT);
			const child = doc.createElement('child'); // Inherits default namespace

			// Adding attribute in inherited default namespace
			child.setAttributeNS('uri:default', 'attr1', 'value1');
			// Adding attribute in inherited prefixed namespace
			child.setAttributeNS('uri:prefixed', 'attr2', 'value2');
			// Adding attribute in new namespace
			child.setAttributeNS('uri:new', 'attr3', 'value3');

			doc.documentElement.appendChild(child);

			const serialized = new XMLSerializer().serializeToString(doc);
			// Should reuse inherited prefixes, only generate for new namespace
			expect(serialized).toContain('attr1="value1"'); // No prefix needed
			expect(serialized).toContain('p:attr2="value2"'); // Reuse existing
			expect(serialized).toContain('xmlns:ns1="uri:new"'); // Generate new
			expect(serialized).toContain('ns1:attr3="value3"');
		});
	});
});
