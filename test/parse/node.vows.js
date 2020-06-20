var wows = require('vows');
var assert = require('assert');
var DOMParser = require('../../lib/dom-parser').DOMParser;
var XMLSerializer = require('../../lib/dom-parser').XMLSerializer;
var parser = new DOMParser();
// Create a Test Suite
wows.describe('XML Node Parse').addBatch({
    'element': function () { 
    	var dom = new DOMParser().parseFromString('<xml><child/></xml>');
    	assert.equal(dom.childNodes.length, 1);
    	assert.equal(dom.documentElement.childNodes.length, 1);
    	assert.equal(dom.documentElement.tagName, 'xml');
    	assert.equal(dom.documentElement.firstChild.tagName, 'child');
    },
    'text':function(){
    	var dom = new DOMParser().parseFromString('<xml>start center end</xml>');
    	var root = dom.documentElement;
    	assert.equal( root.firstChild.data, 'start center end');
    	assert.equal( root.firstChild.nextSibling, null);
    },
    'cdata': function () {
    	var dom = new DOMParser().parseFromString('<xml>start <![CDATA[<encoded>]]> end<![CDATA[[[[[[[[[]]]]]]]]]]></xml>');
    	var root = dom.documentElement;
    	assert.equal(root.firstChild.data, 'start ');
    	assert.equal(root.firstChild.nextSibling.data, '<encoded>');
    	assert.equal(root.firstChild.nextSibling.nextSibling.nextSibling.data, '[[[[[[[[]]]]]]]]');
    },
    'cdata empty': function () {
    	var dom = new DOMParser().parseFromString('<xml><![CDATA[]]>start <![CDATA[]]> end</xml>');
    	var root = dom.documentElement;
    	assert.equal(root.textContent, 'start  end');
    },
    'comment': function(){
    	var dom = new DOMParser().parseFromString('<xml><!-- comment&>< --></xml>');
    	var root = dom.documentElement;
    	assert.equal(root.firstChild.nodeValue, ' comment&>< ');
    },
    'cdata comment': function(){
    	var dom = new DOMParser().parseFromString('<xml>start <![CDATA[<encoded>]]> <!-- comment -->end</xml>');
    	var root = dom.documentElement;
    	assert.equal(root.firstChild.nodeValue, 'start ');
    	assert.equal(root.firstChild.nextSibling.nodeValue, '<encoded>');
    	assert.equal(root.firstChild.nextSibling.nextSibling.nextSibling.nodeValue, ' comment ');
    	assert.equal(root.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nodeValue, 'end');
    },
    'append node': function () {
    	var dom = new DOMParser().parseFromString('<xml/>');
    	var child = dom.createElement("child");
    	assert.equal(child, dom.documentElement.appendChild(child));
    	assert.equal(child, dom.documentElement.firstChild);
    	var fragment = new dom.createDocumentFragment();
    	assert.equal(child, fragment.appendChild(child));
    },
    'insert node': function () {
    	var dom = new DOMParser().parseFromString('<xml><child/></xml>');
    	var node = dom.createElement("sibling");
    	var child = dom.documentElement.firstChild;
    	child.parentNode.insertBefore(node, child);
    	assert.equal(node, child.previousSibling);
    	assert.equal(node.nextSibling, child);
    	assert.equal(node.parentNode, child.parentNode);
    },
    'insert fragment': function () {
    	var dom = new DOMParser().parseFromString('<xml><child/></xml>');
    	var fragment = dom.createDocumentFragment();
    	assert(fragment.nodeType === 11);
    	var first = fragment.appendChild(dom.createElement("first"));
    	var last = fragment.appendChild(dom.createElement("last"));
    	assert.equal(fragment.firstChild, first);
    	assert.equal(fragment.lastChild, last);
    	assert.equal(last.previousSibling, first);
    	assert.equal(first.nextSibling, last);
    	var child = dom.documentElement.firstChild;
    	child.parentNode.insertBefore(fragment, child);
    	assert.equal(last.previousSibling, first);
    	assert.equal(first.nextSibling, last);
    	assert.equal(child.parentNode.firstChild, first);
    	assert.equal(last, child.previousSibling);
    	assert.equal(last.nextSibling, child);
    	assert.equal(first.parentNode, child.parentNode);
    	assert.equal(last.parentNode, child.parentNode);
    }
}).addBatch({
	"instruction":function(){
		var source = '<?xml version="1.0"?><root><child>&amp;<!-- &amp; --></child></root>';
		var doc = new DOMParser().parseFromString(source,"text/xml");
    	var source2 = new XMLSerializer().serializeToString(doc);
    	assert.equal(source, source2);
	},
	'public id && sysid':function(){
	  	var error = []
	    var parser = new DOMParser({
	    	locator:{},
	    	errorHandler:function(msg){
				error.push(msg);
			}
		});
	    var doc = parser.parseFromString('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html/>', 'text/html');
		assert.equal(doc+'', '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"></html>')

	}
}).export(module); // Run it
//var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
//var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
//var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
//var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
//var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
//var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
//var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
//var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
//var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
//var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
//var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
//var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;
