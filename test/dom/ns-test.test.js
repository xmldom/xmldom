'use strict'

const { DOMParser } = require('../../lib/dom-parser')

// Create a Test Suite
describe('XML Namespace Parse', () => {
	it('supports testlitecns', () => {
		const doc = new DOMParser({
			xmlns: {
				c: 'http://www.xidea.org/lite/core',
				'': 'http://www.w3.org/1999/xhtml',
			},
		}).parseFromString(
			'<html><body><c:var name="a" value="${1}"/></body></html>',
			'text/xml'
		)
		const el = doc.getElementsByTagName('c:var')[0]
		expect(el.namespaceURI).toBe('http://www.xidea.org/lite/core')
		expect(doc.toString()).toBe(
			'<html xmlns="http://www.w3.org/1999/xhtml"><body><c:var name="a" value="${1}" xmlns:c="http://www.xidea.org/lite/core"></c:var></body></html>'
		)
	})

	//ignore default prefix xml attribute
	it('test', () => {
		const w3 = 'http://www.w3.org/1999/xhtml'
		const n1 = 'http://www.frankston.com/public'
		const n2 = 'http://rmf.vc/n2'
		const hx =
			'<html test="a" xmlns="' +
			w3 +
			'" xmlns:rmf="' +
			n1 +
			'"><rmf:foo hello="asdfa"/></html>'

		const doc = new DOMParser().parseFromString(hx, 'text/xml')
		const els = [].slice.call(
			doc.documentElement.getElementsByTagNameNS(n1, 'foo')
		)
		for (let _i = 0, els_1 = els; _i < els_1.length; _i++) {
			const el = els_1[_i]

			const te = doc.createElementNS(n1, 'test')
			te.setAttributeNS(n1, 'bar', 'valx')
			expect(String(te)).toBe('<test xmlns="' + n1 + '" bar="valx"/>')
			el.appendChild(te)
			const tx = doc.createElementNS(n2, 'test')
			tx.setAttributeNS(n2, 'bar', 'valx')
			expect(String(tx)).toBe('<test xmlns="' + n2 + '" bar="valx"/>')
			el.appendChild(tx)
		}
		expect(String(doc)).toBe(
			'<html test="a" xmlns="http://www.w3.org/1999/xhtml" xmlns:rmf="http://www.frankston.com/public"><rmf:foo hello="asdfa"><test xmlns="http://www.frankston.com/public" bar="valx"></test><test xmlns="http://rmf.vc/n2" bar="valx"></test></rmf:foo></html>'
		)
	})
})
