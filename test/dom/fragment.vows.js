var assert = require('assert');
var wows = require('vows');
var DOMParser = require('../../lib/dom-parser').DOMParser;
var XMLSerializer = require('../../lib/dom-parser').XMLSerializer;

wows.describe('DOM DocumentFragment').addBatch({
	// see: http://jsfiddle.net/9Wmh2/1/
	"append empty fragment":function(){
		var document = new DOMParser().parseFromString('<p id="p"/>');
		var fragment = document.createDocumentFragment();
		document.getElementById("p").insertBefore(fragment, null);
		fragment.appendChild(document.createTextNode("a"));
		document.getElementById("p").insertBefore(fragment, null);
		assert.equal(document.toString(), '<p id="p">a</p>');
	},
}).export(module);
