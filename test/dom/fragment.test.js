'use strict'

var wows = require('vows')
var DOMParser = require('../../lib/dom-parser').DOMParser
const assert = require('../assert')

describe('DOM DocumentFragment', () => {
	// see: http://jsfiddle.net/9Wmh2/1/
	it('append empty fragment', () => {
		var document = new DOMParser().parseFromString('<p id="p"/>')
		var fragment = document.createDocumentFragment()
		document.getElementById('p').insertBefore(fragment, null)
		fragment.appendChild(document.createTextNode('a'))
		document.getElementById('p').insertBefore(fragment, null)
		assert(document.toString(), '<p id="p">a</p>')
	})
})
