var wows = require('vows');
var assert = require('assert');
var DOMParser = require('../../lib/dom-parser').DOMParser;
var XMLSerializer = require('../../lib/dom-parser').XMLSerializer;
var parser = new DOMParser();
// Create a Test Suite
wows.describe('XML Node Parse').addBatch({
    'element': function () { 
    	var dom = new DOMParser().parseFromString('<xml><child/></xml>');
    	assert.isTrue (dom.childNodes.length== 1,dom.childNodes.length, 1);
    	assert.isTrue (dom.documentElement.childNodes.length== 1);
    	assert.isTrue (dom.documentElement.tagName== 'xml');
    	assert.isTrue (dom.documentElement.firstChild.tagName== 'child');
    },
    'text':function(){
    	var dom = new DOMParser().parseFromString('<xml>start center end</xml>');
    	var root = dom.documentElement;
    	assert.isTrue( root.firstChild.data =='start center end');
    	assert.isTrue( root.firstChild.nextSibling ==null);
    },
    'cdata': function () {
    	var dom = new DOMParser().parseFromString('<xml>start <![CDATA[<encoded>]]> end<![CDATA[[[[[[[[[]]]]]]]]]]></xml>');
    	var root = dom.documentElement;
    	assert.isTrue ( root.firstChild.data =='start ');
    	assert.isTrue ( root.firstChild.nextSibling.data =='<encoded>');
    	assert.isTrue ( root.firstChild.nextSibling.nextSibling.nextSibling.data =='[[[[[[[[]]]]]]]]');
    },
    'cdata empty': function () {
    	var dom = new DOMParser().parseFromString('<xml><![CDATA[]]>start <![CDATA[]]> end</xml>');
    	var root = dom.documentElement;
    	assert.isTrue ( root.textContent =='start  end');
    },
    'comment': function(){
    	var dom = new DOMParser().parseFromString('<xml><!-- comment&>< --></xml>');
    	var root = dom.documentElement;
    	assert.isTrue ( root.firstChild.nodeValue ==' comment&>< ');
    },
    'cdata comment': function(){
    	var dom = new DOMParser().parseFromString('<xml>start <![CDATA[<encoded>]]> <!-- comment -->end</xml>');
    	var root = dom.documentElement;
    	assert.isTrue ( root.firstChild.nodeValue =='start ');
    	assert.isTrue ( root.firstChild.nextSibling.nodeValue =='<encoded>');
    	assert.isTrue ( root.firstChild.nextSibling.nextSibling.nextSibling.nodeValue ==' comment ');
    	assert.isTrue ( root.firstChild.nextSibling.nextSibling.nextSibling.nextSibling.nodeValue =='end');
    },
    'append node': function () {
    	var dom = new DOMParser().parseFromString('<xml/>');
    	var child = dom.createElement("child");
    	assert.isTrue ( child == dom.documentElement.appendChild(child));
    	assert.isTrue ( child == dom.documentElement.firstChild);
    	var fragment = new dom.createDocumentFragment();
    	assert.isTrue ( child == fragment.appendChild(child));
    },
    'insert node': function () {
    	var dom = new DOMParser().parseFromString('<xml><child/></xml>');
    	var node = dom.createElement("sibling");
    	var child = dom.documentElement.firstChild;
    	child.parentNode.insertBefore(node, child);
    	assert.isTrue ( node == child.previousSibling);
    	assert.isTrue ( node.nextSibling == child);
    	assert.isTrue ( node.parentNode == child.parentNode);
    },
    'insert fragment': function () {
    	var dom = new DOMParser().parseFromString('<xml><child/></xml>');
    	var fragment = dom.createDocumentFragment();
    	assert(fragment.nodeType === 11);
    	var first = fragment.appendChild(dom.createElement("first"));
    	var last = fragment.appendChild(dom.createElement("last"));
    	assert.isTrue ( fragment.firstChild == first);
    	assert.isTrue ( fragment.lastChild == last);
    	assert.isTrue ( last.previousSibling == first);
    	assert.isTrue ( first.nextSibling == last);
    	var child = dom.documentElement.firstChild;
    	child.parentNode.insertBefore(fragment, child);
    	assert.isTrue ( last.previousSibling == first);
    	assert.isTrue ( first.nextSibling == last);
    	assert.isTrue ( child.parentNode.firstChild == first);
    	assert.isTrue ( last == child.previousSibling);
    	assert.isTrue ( last.nextSibling == child);
    	assert.isTrue ( first.parentNode == child.parentNode);
    	assert.isTrue ( last.parentNode == child.parentNode);
    }
}).addBatch({
	"instruction":function(){
		var source = '<?xml version="1.0"?><root><child>&amp;<!-- &amp; --></child></root>';
		var doc = new DOMParser().parseFromString(source,"text/xml");
    	var source2 = new XMLSerializer().serializeToString(doc);
    	assert.isTrue(source == source2,source2);
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
		console.log(doc+'')
		
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
