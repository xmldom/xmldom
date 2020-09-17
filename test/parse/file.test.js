var fs = require('fs');
var wows = require('vows');
var DOMParser = require('../../lib/dom-parser').DOMParser;
var XMLSerializer = require('../../lib/dom-parser').XMLSerializer
const assert = require('../assert')

describe('DOMLocator', () => {
	it('test.xml', () => {
		var data = fs.readFileSync(__dirname+'/file-test1.xml').toString().replace(/\r\n?/g,'\n');
		// fs.writeFileSync(__dirname+'/file-test1.xml',data)
		var expexted = fs.readFileSync(__dirname+'/file-test1.result.xml').toString().replace(/\r\n?/g,'\n');
		var dom = new DOMParser().parseFromString(data);
		var result= new XMLSerializer().serializeToString(dom)
		assert(result, expexted)
		// fs.writeFileSync(__dirname+'/file-test1.result.xml',result)
	})
})

