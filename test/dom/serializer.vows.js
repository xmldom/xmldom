var wows = require('vows');
var DOMParser = require('../../lib/dom-parser').DOMParser;
const assert = require('../assert')

wows.describe('XML Serializer').addBatch({
	'text node containing "]]>"': function() {
		var doc = new DOMParser().parseFromString('<test/>', 'text/xml');
		doc.documentElement.appendChild(doc.createTextNode('hello ]]> there'));
		assert(doc.documentElement.firstChild.toString(), 'hello ]]> there');
	},
	'<script> element with no children': function() {
		var doc = new DOMParser({xmlns:{xmlns:'http://www.w3.org/1999/xhtml'}}).parseFromString('<html2><script></script></html2>', 'text/html');
		assert(doc.documentElement.firstChild.toString(), '<script xmlns="http://www.w3.org/1999/xhtml"></script>');
	},
}).export(module);
