'use strict';

const { DOMParser, XMLSerializer } = require('../../lib');
const { MIME_TYPE } = require('../../lib/conventions');
const { DOMImplementation } = require('../../lib/dom');
const { expectDOMException } = require('../errors/expectDOMException');

describe('XMLSerializer.serializeToString', () => {
	let doc;
	beforeEach(() => {
		doc = new DOMImplementation().createDocument(null, 'root', null);
	});

	describe('namespaces', () => {
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
	});

	describe('attribute escaping', () => {
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

	describe('CDATASection', () => {
		test('serializes a safe CDATASection unchanged', () => {
			doc.documentElement.appendChild(doc.createCDATASection('safe data'));
			expect(new XMLSerializer().serializeToString(doc.documentElement)).toBe('<root><![CDATA[safe data]]></root>');
		});

		test('splits a CDATASection whose data contains "]]>"', () => {
			const cdata = doc.createCDATASection('safe');
			cdata.data = 'foo]]>bar';
			doc.documentElement.appendChild(cdata);
			expect(new XMLSerializer().serializeToString(doc.documentElement)).toBe('<root><![CDATA[foo]]]]><![CDATA[>bar]]></root>');
		});

		test('splits multiple "]]>" occurrences', () => {
			const cdata = doc.createCDATASection('safe');
			cdata.data = 'a]]>b]]>c';
			doc.documentElement.appendChild(cdata);
			expect(new XMLSerializer().serializeToString(doc.documentElement)).toBe(
				'<root><![CDATA[a]]]]><![CDATA[>b]]]]><![CDATA[>c]]></root>'
			);
		});

		test('split output round-trips through DOMParser to equivalent content', () => {
			const cdata = doc.createCDATASection('safe');
			cdata.data = 'foo]]>bar';
			doc.documentElement.appendChild(cdata);
			const serialized = new XMLSerializer().serializeToString(doc.documentElement);
			const reparsed = new DOMParser().parseFromString(serialized, MIME_TYPE.XML_TEXT);
			expect(reparsed.documentElement.textContent).toBe('foo]]>bar');
		});
	});

	describe('backward compatibility', () => {
		test('no options: CDATA "]]>" still splits (regression guard for 0.9.9 behavior)', () => {
			const cdata = doc.createCDATASection('safe');
			cdata.data = 'foo]]>bar';
			doc.documentElement.appendChild(cdata);
			expect(new XMLSerializer().serializeToString(doc)).toBe('<root><![CDATA[foo]]]]><![CDATA[>bar]]></root>');
		});

		test('function as second arg is used as nodeFilter (compat shim)', () => {
			doc.documentElement.appendChild(doc.createTextNode('hello'));
			// nodeFilter returns null for text nodes (skips them), otherwise returns the node.
			// The element has a child in the DOM so it renders as open+close (not self-closing),
			// but the text content is filtered out.
			const nodeFilter = (node) => (node.nodeType === 3 ? null : node);
			const result = new XMLSerializer().serializeToString(doc, nodeFilter);
			expect(result).toBe('<root></root>');
		});
	});

	describe('{ splitCDATASections }', () => {
		test('splitCDATASections: false emits CDATA verbatim (no split, no throw)', () => {
			const cdata = doc.createCDATASection('safe');
			cdata.data = 'foo]]>bar';
			doc.documentElement.appendChild(cdata);
			expect(new XMLSerializer().serializeToString(doc, { splitCDATASections: false })).toBe(
				'<root><![CDATA[foo]]>bar]]></root>'
			);
		});

		test('splitCDATASections: true produces the same split output as 0.9.9 (regression guard)', () => {
			const cdata = doc.createCDATASection('safe');
			cdata.data = 'foo]]>bar';
			doc.documentElement.appendChild(cdata);
			expect(new XMLSerializer().serializeToString(doc, { splitCDATASections: true })).toBe(
				'<root><![CDATA[foo]]]]><![CDATA[>bar]]></root>'
			);
		});
	});

	describe('{ requireWellFormed }', () => {
		describe('CDATASection', () => {
			test('requireWellFormed: true on CDATA without "]]>" does not throw', () => {
				doc.documentElement.appendChild(doc.createCDATASection('safe data'));
				expect(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true })).not.toThrow();
			});

			test('requireWellFormed: true on CDATA with "]]>" throws InvalidStateError', () => {
				const cdata = doc.createCDATASection('safe');
				cdata.data = 'foo]]>bar';
				doc.documentElement.appendChild(cdata);
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});
		});

		describe('Document', () => {
			test('requireWellFormed: true on Document with no documentElement throws InvalidStateError', () => {
				const emptyDoc = new DOMImplementation().createDocument(null, null, null);
				expectDOMException(
					() => new XMLSerializer().serializeToString(emptyDoc, { requireWellFormed: true }),
					'InvalidStateError'
				);
			});
		});

		describe('Text', () => {
			test('requireWellFormed: true on Text with characters outside XML Char production throws InvalidStateError', () => {
				const text = doc.createTextNode('\x01invalid');
				doc.documentElement.appendChild(text);
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on Text with valid characters does not throw', () => {
				doc.documentElement.appendChild(doc.createTextNode('valid text'));
				expect(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true })).not.toThrow();
			});
		});

		describe('Comment', () => {
			test('default: comment with "-->" in data emits verbatim — no throw', () => {
				doc.documentElement.appendChild(doc.createComment('hello-->world'));
				expect(new XMLSerializer().serializeToString(doc)).toBe('<root><!--hello-->world--></root>');
			});

			test('default: comment with "--" in data emits verbatim — no throw', () => {
				doc.documentElement.appendChild(doc.createComment('hello--world'));
				expect(new XMLSerializer().serializeToString(doc)).toBe('<root><!--hello--world--></root>');
			});

			test('requireWellFormed: true on comment with invalid XML Char (\\x00) throws InvalidStateError', () => {
				doc.documentElement.appendChild(doc.createComment('hello\x00world'));
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on comment with "-->" throws InvalidStateError', () => {
				doc.documentElement.appendChild(doc.createComment('hello-->world'));
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on comment with "--" (no "-->") throws InvalidStateError', () => {
				doc.documentElement.appendChild(doc.createComment('hello--world'));
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on comment whose data ends with "-" throws InvalidStateError', () => {
				doc.documentElement.appendChild(doc.createComment('hello-'));
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on comment with clean data does not throw', () => {
				doc.documentElement.appendChild(doc.createComment('clean comment'));
				expect(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true })).not.toThrow();
			});

			test('mutation vector: appendData("-->") then requireWellFormed: true throws InvalidStateError', () => {
				const comment = doc.createComment('clean');
				doc.documentElement.appendChild(comment);
				comment.appendData('-->');
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});
		});

		describe('ProcessingInstruction', () => {
			test('default: PI with ":" in target emits verbatim — no throw', () => {
				const pi = doc.createProcessingInstruction('ns:target', 'data');
				doc.documentElement.appendChild(pi);
				expect(() => new XMLSerializer().serializeToString(doc)).not.toThrow();
			});

			test('default: PI with target "xml" emits verbatim — no throw', () => {
				const pi = doc.createProcessingInstruction('xml', 'version="1.0"');
				doc.documentElement.appendChild(pi);
				expect(() => new XMLSerializer().serializeToString(doc)).not.toThrow();
			});

			test('default: PI with invalid XML Char in data emits verbatim — no throw', () => {
				const pi = doc.createProcessingInstruction('foo', 'data\x00here');
				doc.documentElement.appendChild(pi);
				expect(() => new XMLSerializer().serializeToString(doc)).not.toThrow();
			});

			test('default: PI with "?>" in data emits verbatim — no throw', () => {
				const pi = doc.createProcessingInstruction('foo', 'inject?>evil');
				doc.documentElement.appendChild(pi);
				expect(new XMLSerializer().serializeToString(doc)).toBe('<root><?foo inject?>evil?></root>');
			});

			test('requireWellFormed: true on PI with ":" in target throws InvalidStateError', () => {
				const pi = doc.createProcessingInstruction('ns:target', 'data');
				doc.documentElement.appendChild(pi);
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on PI with target "xml" throws InvalidStateError', () => {
				const pi = doc.createProcessingInstruction('xml', 'version="1.0"');
				doc.documentElement.appendChild(pi);
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on PI with target "XML" (uppercase) throws InvalidStateError', () => {
				const pi = doc.createProcessingInstruction('XML', 'data');
				doc.documentElement.appendChild(pi);
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on PI with target "Xml" (mixed case) throws InvalidStateError', () => {
				const pi = doc.createProcessingInstruction('Xml', 'data');
				doc.documentElement.appendChild(pi);
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on PI with invalid XML Char (\\x00) in data throws InvalidStateError', () => {
				const pi = doc.createProcessingInstruction('foo', 'data\x00here');
				doc.documentElement.appendChild(pi);
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on PI with "?>" in data throws InvalidStateError', () => {
				const pi = doc.createProcessingInstruction('foo', 'inject?>evil');
				doc.documentElement.appendChild(pi);
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on PI with clean target and data does not throw', () => {
				const pi = doc.createProcessingInstruction('xml-stylesheet', 'href="style.css"');
				doc.documentElement.appendChild(pi);
				expect(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true })).not.toThrow();
			});

			test('mutation vector: set PI data to "?>" then requireWellFormed: true throws InvalidStateError', () => {
				const pi = doc.createProcessingInstruction('foo', 'clean');
				doc.documentElement.appendChild(pi);
				pi.data = 'inject?>evil';
				expectDOMException(() => new XMLSerializer().serializeToString(doc, { requireWellFormed: true }), 'InvalidStateError');
			});
		});

		describe('DocumentType', () => {
			test('default: DocumentType with invalid publicId serializes verbatim — no throw', () => {
				const doctype = new DOMImplementation().createDocumentType('name', '"invalid<char"', '');
				const dtDoc = new DOMImplementation().createDocument(null, 'root', doctype);
				expect(() => new XMLSerializer().serializeToString(dtDoc)).not.toThrow();
			});

			test('requireWellFormed: true on DocumentType with invalid publicId throws InvalidStateError', () => {
				const doctype = new DOMImplementation().createDocumentType('name', '"invalid<char"', '');
				const dtDoc = new DOMImplementation().createDocument(null, 'root', doctype);
				expectDOMException(() => new XMLSerializer().serializeToString(dtDoc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on DocumentType with invalid systemId throws InvalidStateError', () => {
				const doctype = new DOMImplementation().createDocumentType('name', '', 'no-quotes-around-this');
				const dtDoc = new DOMImplementation().createDocument(null, 'root', doctype);
				expectDOMException(() => new XMLSerializer().serializeToString(dtDoc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on DocumentType with "]>" in internalSubset throws InvalidStateError', () => {
				const doctype = new DOMImplementation().createDocumentType('name', '', '', ']><injected/>');
				const dtDoc = new DOMImplementation().createDocument(null, 'root', doctype);
				expectDOMException(() => new XMLSerializer().serializeToString(dtDoc, { requireWellFormed: true }), 'InvalidStateError');
			});

			test('requireWellFormed: true on DocumentType with valid fields does not throw', () => {
				const doctype = new DOMImplementation().createDocumentType(
					'html',
					'"-//W3C//DTD HTML 4.01//EN"',
					'"http://www.w3.org/TR/html4/strict.dtd"'
				);
				const dtDoc = new DOMImplementation().createDocument(null, 'root', doctype);
				expect(() => new XMLSerializer().serializeToString(dtDoc, { requireWellFormed: true })).not.toThrow();
			});

			test('direct property write: setting invalid publicId then requireWellFormed: true throws InvalidStateError', () => {
				const doctype = new DOMImplementation().createDocumentType('name', '"-//W3C//DTD//EN"', '');
				const dtDoc = new DOMImplementation().createDocument(null, 'root', doctype);
				doctype.publicId = '"invalid<char"';
				expectDOMException(() => new XMLSerializer().serializeToString(dtDoc, { requireWellFormed: true }), 'InvalidStateError');
			});
		});
	});

	describe('EntityReference', () => {
		test('serializes EntityReference node as &name;', () => {
			const xmlDoc = new DOMImplementation().createDocument(null, '');
			const entityRef = xmlDoc.createEntityReference('amp');
			expect(new XMLSerializer().serializeToString(entityRef)).toBe('&amp;');
		});
	});

	describe('unknown node type (default case)', () => {
		test('serializes unrecognized node type with "??" prefix', () => {
			const xmlDoc = new DOMImplementation().createDocument(null, '');
			// Construct a duck-typed node with a non-standard nodeType to exercise the default branch.
			const fakeNode = { nodeType: 99, nodeName: 'fake', ownerDocument: xmlDoc, firstChild: null };
			expect(new XMLSerializer().serializeToString(fakeNode)).toBe('??fake');
		});
	});

	describe('HTML raw text element with non-data child', () => {
		test('falls back to full serialization for a child with empty data inside <script>', () => {
			const doc = new DOMParser().parseFromString('<html/>', MIME_TYPE.HTML);
			const script = doc.createElement('script');
			// A ProcessingInstruction with empty data has child.data === '' (falsy),
			// which triggers the serializeToString fallback path inside raw text elements.
			const pi = doc.createProcessingInstruction('target', '');
			script.appendChild(pi);
			expect(new XMLSerializer().serializeToString(script)).toBe(
				'<script xmlns="http://www.w3.org/1999/xhtml"><?target ?></script>'
			);
		});
	});
});

describe('Node.toString', () => {
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

	describe('{ requireWellFormed }', () => {
		let doc;
		beforeEach(() => {
			doc = new DOMImplementation().createDocument(null, 'root', null);
		});

		test('node.toString({requireWellFormed: true}) on node with "]]>" in CDATA child throws InvalidStateError', () => {
			const cdata = doc.createCDATASection('safe');
			cdata.data = 'foo]]>bar';
			doc.documentElement.appendChild(cdata);
			expectDOMException(() => doc.toString({ requireWellFormed: true }), 'InvalidStateError');
		});
	});
});

describe('NodeList.toString', () => {
	let doc;
	beforeEach(() => {
		doc = new DOMImplementation().createDocument(null, 'root', null);
	});

	describe('{ requireWellFormed }', () => {
		test('nodeList.toString({requireWellFormed: true}) on list containing CDATA with "]]>" throws InvalidStateError', () => {
			const cdata = doc.createCDATASection('safe');
			cdata.data = 'foo]]>bar';
			doc.documentElement.appendChild(cdata);
			expectDOMException(() => doc.documentElement.childNodes.toString({ requireWellFormed: true }), 'InvalidStateError');
		});
	});
});
