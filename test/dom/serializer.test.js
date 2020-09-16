var wows = require('vows');
var DOMParser = require('../../lib/dom-parser').DOMParser;
const assert = require('../assert')

describe('XML Serializer', () => {
  it('supports text node containing "]]>"', () => {
    var doc = new DOMParser().parseFromString('<test/>', 'text/xml');
    doc.documentElement.appendChild(doc.createTextNode('hello ]]> there'));
    assert(doc.documentElement.firstChild.toString(), 'hello ]]> there');
  })

  it('supports <script> element with no children', () => {
    var doc = new DOMParser({xmlns:{xmlns:'http://www.w3.org/1999/xhtml'}}).parseFromString('<html2><script></script></html2>', 'text/html');
    assert(doc.documentElement.firstChild.toString(), '<script xmlns="http://www.w3.org/1999/xhtml"></script>');
  })
})
