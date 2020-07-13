"use strict";

var wows = require('vows');
var DOMParser = require('../../lib/dom-parser').DOMParser;
var assert = require('../assert')
var XMLSerializer = require('../../lib/dom-parser').XMLSerializer;

// Create a Test Suite
describe('XML Namespace Parse', () => {
    // See: http://jsfiddle.net/bigeasy/ShcXP/1/
    it("supports Document_getElementsByTagName", () => {
    	var doc = new DOMParser().parseFromString('<a><b/></a>');
    	assert(doc.getElementsByTagName('*').length, 2, 'on doc');
    	assert(doc.documentElement.getElementsByTagName('*').length, 1, 'on doc.documentElement');
    })

    it("supports getElementsByTagName", () => {
       var doc = new DOMParser().parseFromString('<xml xmlns="http://test.com" xmlns:t="http://test.com" xmlns:t2="http://test2.com">' +
       		'<t:test/><test/><t2:test/>'+
       		'<child attr="1"><test><child attr="2"/></test></child>' +
       		'<child attr="3"/></xml>','text/xml');
       var childs = doc.documentElement.getElementsByTagName('child');
       assert(childs.item(0).getAttribute('attr'), "1",childs.item(0)+'');
       assert(childs.item(1).getAttribute('attr'), "2",childs.item(1)+'');
       assert(childs.item(2).getAttribute('attr'), "3",childs.item(2)+'');
       assert(childs.length, 3, 'documentElement children length');
       
       var childs = doc.getElementsByTagName('child');
       assert(childs.item(0).getAttribute('attr'), "1",childs.item(0)+'');
       assert(childs.item(1).getAttribute('attr'), "2",childs.item(1)+'');
       assert(childs.item(2).getAttribute('attr'), "3",childs.item(2)+'');
       assert(childs.length, 3, 'doc children length');
       
       
       
       
       
       var childs = doc.documentElement.getElementsByTagName('*');
       for(var i=0,buf = [];i<childs.length;i++){
       	buf.push(childs[i].tagName)
       }
       assert(childs.length, 7, buf);
       
       
       
       
		var feed = new DOMParser().parseFromString('<feed><entry>foo</entry></feed>');
		var entries = feed.documentElement.getElementsByTagName('entry');
		assert.equal(entries.length , 1,'assert entry nodelist length ==1');
		assert(entries[0].nodeName, 'entry');
        assert(feed.documentElement.childNodes.item(0).nodeName, 'entry');
    })

    it("supports getElementsByTagNameNS", () => {
       var doc = new DOMParser().parseFromString('<xml xmlns="http://test.com" xmlns:t="http://test.com" xmlns:t2="http://test2.com">' +
       		'<t:test/><test/><t2:test/>'+
       		'<child attr="1"><test><child attr="2"/></test></child>' +
       		'<child attr="3"/></xml>','text/xml');
       		
       var childs = doc.documentElement.getElementsByTagNameNS("http://test.com",'*');
       var i=0
       assert(childs.length, 6);
       
       var childs = doc.getElementsByTagNameNS("http://test.com",'*');
       assert(childs.length, 7);
       
       var childs = doc.documentElement.getElementsByTagNameNS("http://test.com",'test');
       assert(childs.length, 3);
       
       var childs = doc.getElementsByTagNameNS("http://test.com",'test');
       assert(childs.length, 3);

       var childs = doc.getElementsByTagNameNS("*", "test");
       assert(childs.length, 4);

       var childs = doc.documentElement.getElementsByTagNameNS("*", "test");
       assert(childs.length, 4);
       
    })

    it("supports getElementById", () => {
       var doc = new DOMParser().parseFromString('<xml xmlns="http://test.com" id="root">' +
       		'<child id="a1" title="1"><child id="a2"  title="2"/></child>' +
       		'<child id="a1"   title="3"/></xml>','text/xml');
       assert.isTrue(doc.getElementById('root') != null, 'root')
       assert(doc.getElementById('a1').getAttribute('title'), "1", "first");
       assert(doc.getElementById('a2').getAttribute('title'), "2", "second");
       assert(doc.getElementById('a2').getAttribute('title2'), "", "empty");
    })

    it("can properly append exist child", () => {
       var doc = new DOMParser().parseFromString('<xml xmlns="http://test.com" id="root">' +
       		'<child1 id="a1" title="1"><child11 id="a2"  title="2"/></child1>' +
       		'<child2 id="a1"   title="3"/><child3 id="a1"   title="3"/></xml>','text/xml');
       	
       	var doc1 = doc;
       	var str1=new XMLSerializer().serializeToString(doc);
       	var doc2 = doc1.cloneNode(true);
       	var doc3 = doc1.cloneNode(true);
       	var doc4 = doc1.cloneNode(true);
       	
       	doc3.documentElement.appendChild(doc3.documentElement.lastChild);
       	doc4.documentElement.appendChild(doc4.documentElement.firstChild);
       	
       	var str2=new XMLSerializer().serializeToString(doc2);
       	var str3=new XMLSerializer().serializeToString(doc3);
       	var str4=new XMLSerializer().serializeToString(doc4);
       	assert(str1, str2, 'str1 == str2')
        assert(str2, str3, 'str2 == str3');
       	assert.isTrue(str3 != str4, 'str4 != str3:' + str3);
       	assert(str3.length, str4.length, 'str3 and str4 have same length');
    })

    it("can properly append exist other child", () => {
    	var doc = new DOMParser().parseFromString('<xml xmlns="http://test.com" id="root">' +
       		'<child1 id="a1" title="1"><child11 id="a2"  title="2"><child/></child11></child1>' +
       		'<child2 id="a1"   title="3"/><child3 id="a1"   title="3"/></xml>','text/xml');
       	
       	var doc1 = doc;
       	var str1=new XMLSerializer().serializeToString(doc);
       	var doc2 = doc1.cloneNode(true);
       	
       	assert(doc2.documentElement.lastChild.childNodes.length, 0, 'initially 0');
       	doc2.documentElement.appendChild(doc2.documentElement.firstChild.firstChild);
       	
       	var str2=new XMLSerializer().serializeToString(doc2);
       	
       	assert(doc2.documentElement.lastChild.childNodes.length, 1, '1 after adding');
       	assert.isTrue(str1 != str2, 'str1 != str2');
       	assert.isTrue(str1.length != str2.length, 'str1/length != str2.length');
       	var doc3 = new DOMParser().parseFromString(str2,'text/xml');
       	doc3.documentElement.firstChild.appendChild(doc3.documentElement.lastChild);
       	var str3 = new XMLSerializer().serializeToString(doc3);
       	assert(str1, str3, 'final assertion');
    })

    it("can properly set textContent", () => {
        var doc = new DOMParser().parseFromString('<test><a/><b><c/></b></test>');
        var a = doc.documentElement.firstChild;
        var b = a.nextSibling;
        a.textContent = 'hello';
        assert(doc.documentElement.toString(), '<test><a>hello</a><b><c/></b></test>');
        b.textContent = 'there';
        assert(doc.documentElement.toString(), '<test><a>hello</a><b>there</b></test>');
        b.textContent = '';
        assert(doc.documentElement.toString(), '<test><a>hello</a><b/></test>');
        doc.documentElement.textContent = 'bye';
        assert(doc.documentElement.toString(), '<test>bye</test>');
    })

    xit("nested append failed", () => {
    })

    xit("self append failed", () => {
    })
})
