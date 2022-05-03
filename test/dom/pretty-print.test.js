'use strict'

const { DOMParser, XMLSerializer } = require('../../lib')
const { MIME_TYPE } = require('../../lib/conventions')

describe('XML Serializer - pretty print', () => {
  it('should prettify xml', () => {
		const xml = '<xml xmlns="AAA" ><parent attr="first"><child attr="two">text node</child><child /></parent></xml>'
    const expected = `
<xml xmlns="AAA">
  <parent attr="first">
    <child attr="two">
      text node
    </child>
    <child/>
  </parent>
</xml>`
		const dom = new DOMParser().parseFromString(xml, MIME_TYPE.XML_TEXT)
    expect(dom.toString(false, null, true).trim()).toBe(expected.trim())
	})
  it('should add default indent "  "', () => {
		const xml = '<xml><one /></xml>'
    const defaultIndent = '  ';
    const expected = `
<xml>
${defaultIndent}<one/>
</xml>`
		const dom = new DOMParser().parseFromString(xml, MIME_TYPE.XML_TEXT)
    expect(dom.toString(false, null, true).trim()).toBe(expected.trim())
	})
  it('should accept optional indent param', () => {
		const xml = '<xml><one /></xml>'
    const indent = '\t';
    const expected = `
<xml>
${indent}<one/>
</xml>`
		const dom = new DOMParser().parseFromString(xml, MIME_TYPE.XML_TEXT)
    expect(dom.toString(false, null, { indent }).trim()).toBe(expected.trim())
	})
  it('should be off, if falsy', () => {
		const xml = `
<xml>
  <one /></xml>`
    const expected = `
<xml>
  <one/></xml>`

		const dom = new DOMParser().parseFromString(xml, MIME_TYPE.XML_TEXT)
    expect(dom.toString(false, null, false).trim()).toBe(expected.trim())
    expect(dom.toString(false, null, null).trim()).toBe(expected.trim())
    expect(dom.toString().trim()).toBe(expected.trim())
	})
  it('should handle basic formatted xml', () => {
		const xml = `
<xml>
  <parent attr="first">
    <child attr="two">
      text node
    </child>
    <child />
  </parent>
</xml>`
    const indent = '  ';
    const expected = `
<xml>
${indent}<parent attr="first">
${indent}${indent}<child attr="two">
${indent}${indent}${indent}text node
${indent}${indent}</child>
${indent}${indent}<child/>
${indent}</parent>
</xml>`
		const dom = new DOMParser().parseFromString(xml, MIME_TYPE.XML_TEXT)
    expect(dom.toString(false, null, { indent }).trim()).toBe(expected.trim())
	})
  it('should clean weird formating', () => {
    const xml = `
<xml>
  <parent attr="first">

    <child attr="two">
text node
    </child>
<child attr="three" >text</child><child />
<child attr="four" >text
                </child>

    <child />
  </parent>


</xml>`
    const indent = '  ';
    const expected = `
<xml>
${indent}<parent attr="first">
${indent}${indent}<child attr="two">
${indent}${indent}${indent}text node
${indent}${indent}</child>
${indent}${indent}<child attr="three">
${indent}${indent}${indent}text
${indent}${indent}</child>
${indent}${indent}<child/>
${indent}${indent}<child attr="four">
${indent}${indent}${indent}text
${indent}${indent}</child>
${indent}${indent}<child/>
${indent}</parent>
</xml>`
    const dom = new DOMParser().parseFromString(xml, MIME_TYPE.XML_TEXT)
    expect(dom.toString(false, null, { indent }).trim()).toBe(expected.trim())
  })
  it('should work for html', () => {
		const html = `
<html>
<body>
 <div>hello world</div>
</body>
</html>
`
    const indent = '  ';
    const expected = `
<html xmlns="http://www.w3.org/1999/xhtml">
${indent}<body>
${indent}${indent}<div>
${indent}${indent}${indent}hello world
${indent}${indent}</div>
${indent}</body>
</html>`
		const dom = new DOMParser().parseFromString(html, MIME_TYPE.HTML)
    expect(dom.toString(true, null, { indent }).trim()).toBe(expected.trim())
	})
})
