var wows = require('vows');
var DOMParser = require('../../lib/dom-parser').DOMParser;
const assert = require('../assert')

// Create a Test Suite
wows.describe('XML Namespace Parse').addBatch({
    'default namespace': function () { 
       var dom = new DOMParser().parseFromString('<xml xmlns="http://test.com"><child attr="1"/></xml>','text/xml');
       var root = dom.documentElement;
       assert(root.namespaceURI, 'http://test.com')
       assert(root.lookupNamespaceURI(''), 'http://test.com')
       assert(root.firstChild.namespaceURI, 'http://test.com')
       assert(root.firstChild.lookupNamespaceURI(''), 'http://test.com')
       assert(root.firstChild.getAttributeNode('attr').namespaceURI, null)
    },
    'prefix namespace': function () { 
       var dom = new DOMParser().parseFromString('<xml xmlns:p1="http://p1.com" xmlns:p2="http://p2.com"><p1:child a="1" p1:attr="1" b="2"/><p2:child/></xml>','text/xml');
       var root = dom.documentElement;
       assert(root.firstChild.namespaceURI, 'http://p1.com')
       assert(root.lookupNamespaceURI('p1'), 'http://p1.com')
       assert(root.firstChild.getAttributeNode('attr'), null)
       assert(root.firstChild.getAttributeNode('p1:attr').namespaceURI, 'http://p1.com')
       assert(root.firstChild.nextSibling.namespaceURI, 'http://p2.com')
       assert(root.firstChild.nextSibling.lookupNamespaceURI('p2'), 'http://p2.com')
    },
    'after prefix namespace': function () { 
       var dom = new DOMParser().parseFromString('<xml xmlns:p="http://test.com"><p:child xmlns:p="http://p.com"/><p:child/></xml>','text/xml');
       var root = dom.documentElement;
       assert(root.firstChild.namespaceURI, 'http://p.com')
       assert(root.lastChild.namespaceURI, 'http://test.com')
       assert(root.firstChild.nextSibling.lookupNamespaceURI('p'), 'http://test.com')
    }
}).export(module); // Run it
