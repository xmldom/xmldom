var wows = require('vows');
var DOMParser = require('../../lib/dom-parser').DOMParser;
const assert = require('../assert')

wows.describe('DOM DocumentFragment').addBatch({
	// see: http://jsfiddle.net/9Wmh2/1/
	"append empty fragment":function(){
		var document = new DOMParser().parseFromString('<p id="p"/>');
		var fragment = document.createDocumentFragment();
		document.getElementById("p").insertBefore(fragment, null);
		fragment.appendChild(document.createTextNode("a"));
		document.getElementById("p").insertBefore(fragment, null);
		assert(document.toString(), '<p id="p">a</p>');
	},
}).export(module);
