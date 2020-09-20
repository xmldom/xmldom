'use strict'

const fs = require('fs')
const DOMParser = require('../../lib/dom-parser').DOMParser

describe('from file', () => {
	it('file-test1.xml', () => {
		const data = fs
			.readFileSync(__dirname + '/file-test1.xml')
			.toString()
			.replace(/\r\n?/g, '\n')
		const expexted = fs
			.readFileSync(__dirname + '/file-test1.result.xml')
			.toString()
			.replace(/\r\n?/g, '\n')
		// fs.writeFileSync(__dirname+'/file-test1.result.xml',result)

		expect(new DOMParser().parseFromString(data).toString()).toStrictEqual(
			expexted
		)
	})
})
