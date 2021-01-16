'use strict'

const { DOMParser } = require('../../lib/dom-parser')

describe('DOM DocumentFragment', () => {
	// see: http://jsfiddle.net/9Wmh2/1/
	it('append empty fragment', () => {
		const document = new DOMParser().parseFromString('<p id="p"/>')
		const fragment = document.createDocumentFragment()
		document.getElementById('p').insertBefore(fragment, null)
		fragment.appendChild(document.createTextNode('a'))
		document.getElementById('p').insertBefore(fragment, null)
		expect(document.toString()).toEqual('<p id="p">a</p>')
	})
})
