'use strict';

const { DOMImplementation, Node } = require('../../lib');

describe('compareDocumentPosition on disconnected trees', () => {
	test.each(['elements', 'fragments', 'attributes', 'doctypes'])('%s have stable opposite ordering', (kind) => {
		const impl = new DOMImplementation();
		const doc = impl.createDocument(null, 'root', null);
		let first;
		let second;
		if (kind === 'elements') {
			first = doc.createElement('a');
			second = doc.createElement('b');
		} else if (kind === 'fragments') {
			first = doc.createDocumentFragment().appendChild(doc.createElement('a'));
			second = doc.createDocumentFragment().appendChild(doc.createElement('b'));
		} else if (kind === 'attributes') {
			first = doc.createAttribute('a');
			second = doc.createAttribute('b');
		} else {
			first = impl.createDocumentType('a');
			second = impl.createDocumentType('b');
		}
		const forward = first.compareDocumentPosition(second);
		const backward = second.compareDocumentPosition(first);
		expect(forward & Node.DOCUMENT_POSITION_DISCONNECTED).toBeTruthy();
		expect(forward & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC).toBeTruthy();
		expect([35, 37]).toContain(forward);
		expect(forward ^ backward).toBe(Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_FOLLOWING);
		expect(first.compareDocumentPosition(second)).toBe(forward);
	});

	test('a detached attribute can be compared with its former owner', () => {
		const doc = new DOMImplementation().createDocument(null, 'root', null);
		const attr = doc.createAttribute('id');
		expect(attr.compareDocumentPosition(doc.documentElement) & Node.DOCUMENT_POSITION_DISCONNECTED).toBeTruthy();
		expect(doc.documentElement.compareDocumentPosition(attr) & Node.DOCUMENT_POSITION_DISCONNECTED).toBeTruthy();
	});

	test('cloning a previously compared root does not copy its ordering identity', () => {
		const doc = new DOMImplementation().createDocument(null, 'root', null);
		const first = doc.createElement('a');
		first.compareDocumentPosition(doc.createElement('b'));
		const clone = first.cloneNode(true);
		expect(first.compareDocumentPosition(clone) ^ clone.compareDocumentPosition(first)).toBe(6);
	});
});
