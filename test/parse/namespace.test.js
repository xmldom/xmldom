'use strict';

var DOMParser = require('../../lib/dom-parser').DOMParser;
const assert = require('assert');

// Create a Test Suite
describe('XML Namespace Parse', () => {
    it('default namespace', () => {
       var dom = new DOMParser().parseFromString('<xml xmlns="http://test.com"><child attr="1"/></xml>','text/xml');
       var root = dom.documentElement;
       assert.strictEqual(root.namespaceURI, 'http://test.com')
       assert.strictEqual(root.lookupNamespaceURI(''), 'http://test.com')
       assert.strictEqual(root.firstChild.namespaceURI, 'http://test.com')
       assert.strictEqual(root.firstChild.lookupNamespaceURI(''), 'http://test.com')
       assert.strictEqual(root.firstChild.getAttributeNode('attr').namespaceURI, null)
    })

    it('prefix namespace', () => {
       var dom = new DOMParser().parseFromString('<xml xmlns:p1="http://p1.com" xmlns:p2="http://p2.com"><p1:child a="1" p1:attr="1" b="2"/><p2:child/></xml>','text/xml');
       var root = dom.documentElement;
       assert.strictEqual(root.firstChild.namespaceURI, 'http://p1.com')
       assert.strictEqual(root.lookupNamespaceURI('p1'), 'http://p1.com')
       assert.strictEqual(root.firstChild.getAttributeNode('attr'), null)
       assert.strictEqual(root.firstChild.getAttributeNode('p1:attr').namespaceURI, 'http://p1.com')
       assert.strictEqual(root.firstChild.nextSibling.namespaceURI, 'http://p2.com')
       assert.strictEqual(root.firstChild.nextSibling.lookupNamespaceURI('p2'), 'http://p2.com')
    })

    it('after prefix namespace', () => {
       var dom = new DOMParser().parseFromString('<xml xmlns:p="http://test.com"><p:child xmlns:p="http://p.com"/><p:child/></xml>','text/xml');
       var root = dom.documentElement;
       assert.strictEqual(root.firstChild.namespaceURI, 'http://p.com')
       assert.strictEqual(root.lastChild.namespaceURI, 'http://test.com')
       assert.strictEqual(root.firstChild.nextSibling.lookupNamespaceURI('p'), 'http://test.com')
    })
})
