var XMLSerializer = require('../../lib/dom-parser').XMLSerializer;
var DOMParser = require('../../lib/dom-parser').DOMParser;
const assert = require('../assert')

// Create a Test Suite
describe('XML Namespace Parse', () => {
	it("can properly set clone", () => {
		var doc1 = new DOMParser().parseFromString("<doc1 attr1='1' attr2='a2'>text1<child>text2</child></doc1>",'text/xml')
		var doc1s = new XMLSerializer().serializeToString(doc1);
		var n =doc1.cloneNode(true)
		assert(n, doc1s)
	})

	it("can properly import", () => {
		var doc1 = new DOMParser().parseFromString("<doc2 attr='2'/>")
		var doc2 = new DOMParser().parseFromString("<doc1 attr1='1' attr2='a2'>text1<child>text2</child></doc1>",'text/xml')
		
		var doc3 = new DOMParser().parseFromString("<doc2 attr='2'><doc1 attr1='1' attr2='a2'>text1<child>text2</child></doc1></doc2>")
		var n =doc1.importNode(doc2.documentElement, true)
		doc1.documentElement.appendChild(n)
		assert(doc1, doc3+'')
		assert.isTrue(doc2 != doc3+'')
	})
})
