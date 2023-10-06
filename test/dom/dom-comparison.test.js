'use strict';
const { Node } = require('../../lib/dom');
const { DOMParser } = require('../../lib/dom-parser');
const { MIME_TYPE } = require('../../lib/conventions');

// Tests following for steps in the specification
// https://dom.spec.whatwg.org/#dom-node-comparedocumentposition
describe('DOM position comparison', () => {
	const dp = new DOMParser();
	const x0 = dp.parseFromString(
		'<x0 foo="a" bar="b">' +
			'<x1 foo="a" bar="b">' +
			'<x2 foo="a" bar="b">c</x2>' +
			'<y2 foo="a" bar="b">d</y2>' +
			'</x1>' +
			'<y1 foo="a" bar="b">' +
			'<z2 foo="a" bar="b">e</z2>' +
			'</y1></x0>',
		MIME_TYPE.XML_TEXT
	).documentElement;
	const x1 = x0.childNodes[0];
	const y1 = x0.childNodes[1];
	const x2 = x1.childNodes[0];
	const y2 = x1.childNodes[1];
	const z2 = y1.childNodes[0];
	const foo = x0.attributes[0];
	const bar = x0.attributes[1];
	let text = x2.childNodes[0];
	test('Step 1', () => {
		expect(x0.compareDocumentPosition(x0)).toBe(0);
		expect(x1.compareDocumentPosition(x1)).toBe(0);
		expect(foo.compareDocumentPosition(foo)).toBe(0);
		expect(text.compareDocumentPosition(text));
	});
	test('Step 5 2 1 1', async () => {
		let result = Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + Node.DOCUMENT_POSITION_PRECEDING;
		expect(bar.compareDocumentPosition(foo)).toBe(result);
	});
	test('Step 5 2 1 2', async () => {
		let result = x0.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC + x0.DOCUMENT_POSITION_FOLLOWING;
		expect(foo.compareDocumentPosition(bar)).toBe(result);
	});
	test('Step 6', () => {
		let result = x0.DOCUMENT_POSITION_DISCONNECTED + x0.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
		let resPre = result + x0.DOCUMENT_POSITION_PRECEDING;
		let resFol = result + x0.DOCUMENT_POSITION_FOLLOWING;
		const root = dp.parseFromString('<xml><baz abaz="y"></baz></xml>', MIME_TYPE.XML_TEXT).documentElement;
		const baz = root.childNodes[0];
		const abaz = baz.attributes[0];
		// This ensures the comparison is stable.
		let comp = x0.compareDocumentPosition(root) === resPre;
		expect(x0.compareDocumentPosition(root)).toBe(comp ? resPre : resFol);
		expect(root.compareDocumentPosition(x0)).toBe(comp ? resFol : resPre);
		expect(x1.compareDocumentPosition(baz)).toBe(comp ? resPre : resFol);
		expect(baz.compareDocumentPosition(x1)).toBe(comp ? resFol : resPre);
		expect(foo.compareDocumentPosition(abaz)).toBe(comp ? resPre : resFol);
		expect(abaz.compareDocumentPosition(foo)).toBe(comp ? resFol : resPre);
	});
	test('Step 7', () => {
		let result = x0.DOCUMENT_POSITION_CONTAINS + x0.DOCUMENT_POSITION_PRECEDING;
		expect(x1.compareDocumentPosition(x0)).toBe(result);
		expect(x2.compareDocumentPosition(x0)).toBe(result);
		expect(x2.compareDocumentPosition(x1)).toBe(result);
		expect(foo.compareDocumentPosition(x0)).toBe(result);
	});
	test('Step 8', () => {
		let result = x0.DOCUMENT_POSITION_CONTAINED_BY + x0.DOCUMENT_POSITION_FOLLOWING;
		expect(x0.compareDocumentPosition(x1)).toBe(20);
		expect(x0.compareDocumentPosition(x2)).toBe(20);
		expect(x1.compareDocumentPosition(x2)).toBe(20);
		expect(x0.compareDocumentPosition(foo)).toBe(20);
	});
	test('Step 9', () => {
		let result = x0.DOCUMENT_POSITION_PRECEDING;
		expect(y1.compareDocumentPosition(x1)).toBe(result);
		expect(y1.compareDocumentPosition(x2)).toBe(result);
		expect(z2.compareDocumentPosition(x2)).toBe(result);
		expect(z2.compareDocumentPosition(x1)).toBe(result);
		expect(y1.compareDocumentPosition(x1.attributes[0])).toBe(result);
		expect(x1.attributes[0].compareDocumentPosition(foo)).toBe(result);
		expect(y1.attributes[0].compareDocumentPosition(foo)).toBe(result);
	});
	test('Step 10', () => {
		let result = x0.DOCUMENT_POSITION_FOLLOWING;
		expect(x1.compareDocumentPosition(y1)).toBe(result);
		expect(x2.compareDocumentPosition(y1)).toBe(result);
		expect(x2.compareDocumentPosition(z2)).toBe(result);
		expect(x1.compareDocumentPosition(z2)).toBe(result);
		expect(x1.attributes[0].compareDocumentPosition(y1)).toBe(result);
		expect(foo.compareDocumentPosition(x1.attributes[0])).toBe(result);
		expect(foo.compareDocumentPosition(y1.attributes[0])).toBe(result);
	});
});
