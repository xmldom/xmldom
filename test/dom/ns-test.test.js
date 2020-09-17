"use strict";
var assert = require('../assert');
var DOMParser = require('../../lib/dom-parser').DOMParser;


// Create a Test Suite
describe('XML Namespace Parse', () => {
	it("supports testlitecns", () => {
		var doc = new DOMParser({
			xmlns:{'c':'http://www.xidea.org/lite/core','':'http://www.w3.org/1999/xhtml'}
		}).parseFromString('<html><body><c:var name="a" value="${1}"/></body></html>', "text/xml");
		var el = doc.getElementsByTagName('c:var')[0];
		assert(el.namespaceURI, 'http://www.xidea.org/lite/core')
		assert(doc, '<html xmlns="http://www.w3.org/1999/xhtml"><body><c:var name="a" value="${1}" xmlns:c="http://www.xidea.org/lite/core"></c:var></body></html>')
	})

	//ignore default prefix xml attribute 
	it("test", () => {
		var w3 = "http://www.w3.org/1999/xhtml";
		var n1 = "http://www.frankston.com/public";
		var n2 = "http://rmf.vc/n2";
		var hx = '<html test="a" xmlns="' + w3 + '" xmlns:rmf="' + n1 + '"><rmf:foo hello="asdfa"/></html>';
		
		var doc = new DOMParser().parseFromString(hx, "text/xml");
		var els = [].slice.call(doc.documentElement.getElementsByTagNameNS(n1, "foo"));
		for (var _i = 0, els_1 = els; _i < els_1.length; _i++) {
		    var el = els_1[_i];
		    
		    var te = doc.createElementNS(n1, "test");
		    te.setAttributeNS(n1, "bar", "valx");
		    var te = doc.createElementNS(n1, "test");
		    te.setAttributeNS(n1, "bar", "valx");
		    assert.equal(String(te),'<test xmlns="'+n1+'" bar="valx"/>', `1. i ${_i}, ${el}`);
		    el.appendChild(te);
		    var tx = doc.createElementNS(n2, "test");
		    tx.setAttributeNS(n2, "bar", "valx");
		    assert.equal(String(tx),'<test xmlns="'+n2+'" bar="valx"/>', `2. i ${_i}, ${el}`);
		    el.appendChild(tx);
		}
		var sr = String(doc);
		assert(sr, '<html test="a" xmlns="http://www.w3.org/1999/xhtml" xmlns:rmf="http://www.frankston.com/public"><rmf:foo hello="asdfa"><test xmlns="http://www.frankston.com/public" bar="valx"></test><test xmlns="http://rmf.vc/n2" bar="valx"></test></rmf:foo></html>');

	})
})
