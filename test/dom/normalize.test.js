'use strict';

const { describe, expect, test } = require('@jest/globals');
const { DOMImplementation } = require('../../lib/dom');

/**
 * `Node#normalize()` merges each run of adjacent `Text` siblings into the first
 * non-empty node of the run, which survives and carries the concatenated data (node
 * identity / locator semantics). The O(K) rewrite (GHSA-93r5-fhx6-vmg9) must keep
 * that invariant.
 */
describe('Node#normalize adjacent-text merge', () => {
	const doc = () => new DOMImplementation().createDocument(null, 'root');

	test('merges a run of adjacent text nodes into the first, which survives with the concatenated data', () => {
		const d = doc();
		const root = d.documentElement;
		const first = d.createTextNode('a');
		root.appendChild(first);
		root.appendChild(d.createTextNode('b'));
		root.appendChild(d.createTextNode('c'));

		root.normalize();

		expect(root.childNodes.length).toBe(1);
		expect(root.firstChild).toBe(first); // the first node survives (identity)
		expect(first.data).toBe('abc');
		expect(first.nodeValue).toBe('abc');
		expect(first.length).toBe(3);
		expect(root.lastChild).toBe(first);
		expect(first.nextSibling).toBeNull();
	});

	test('merges only within a run, leaving non-text nodes and their boundaries intact', () => {
		const d = doc();
		const root = d.documentElement;
		const t1 = d.createTextNode('a');
		root.appendChild(t1);
		root.appendChild(d.createTextNode('b'));
		const el = d.createElement('e');
		root.appendChild(el);
		const t2 = d.createTextNode('c');
		root.appendChild(t2);
		root.appendChild(d.createTextNode('d'));

		root.normalize();

		expect(root.childNodes.length).toBe(3);
		expect(root.firstChild).toBe(t1);
		expect(t1.data).toBe('ab');
		expect(root.childNodes.item(1)).toBe(el);
		expect(root.lastChild).toBe(t2);
		expect(t2.data).toBe('cd');
		// sibling links are consistent after the batch merge
		expect(t1.nextSibling).toBe(el);
		expect(el.previousSibling).toBe(t1);
		expect(el.nextSibling).toBe(t2);
		expect(t2.previousSibling).toBe(el);
	});
});

function expectChildren(parent, children) {
	expect(parent.childNodes.length).toBe(children.length);
	expect(parent.firstChild).toBe(children[0] || null);
	expect(parent.lastChild).toBe(children[children.length - 1] || null);
	expect(parent.childNodes.item(children.length)).toBeNull();
	children.forEach((child, index) => {
		expect(parent.childNodes.item(index)).toBe(child);
		expect(child.parentNode).toBe(parent);
		expect(child.previousSibling).toBe(children[index - 1] || null);
		expect(child.nextSibling).toBe(children[index + 1] || null);
	});
}

function expectDetached(nodes) {
	nodes.forEach((node) => {
		expect(node.parentNode).toBeNull();
		expect(node.previousSibling).toBeNull();
		expect(node.nextSibling).toBeNull();
	});
}

describe('Node#normalize empty text removal', () => {
	test.each([1, 3])('removes a run of %i empty text nodes', (count) => {
		const doc = new DOMImplementation().createDocument(null, 'root');
		const root = doc.documentElement;
		const empty = Array.from({ length: count }, () => root.appendChild(doc.createTextNode('')));

		root.normalize();

		expectChildren(root, []);
		expectDetached(empty);
		empty.forEach((node, index) => expect(root.childNodes[index]).toBeUndefined());
		root.normalize();
		expectChildren(root, []);
	});

	test('removes isolated empty text before, between, and after non-text children', () => {
		const doc = new DOMImplementation().createDocument(null, 'root');
		const root = doc.documentElement;
		const first = doc.createElement('first');
		const last = doc.createElement('last');
		const empty = [doc.createTextNode(''), doc.createTextNode(''), doc.createTextNode('')];
		[empty[0], first, empty[1], last, empty[2]].forEach((node) => root.appendChild(node));

		root.normalize();

		expectChildren(root, [first, last]);
		expectDetached(empty);
	});

	test('keeps the first non-empty text node when a mixed run starts with empty text', () => {
		const doc = new DOMImplementation().createDocument(null, 'root');
		const root = doc.documentElement;
		const nodes = ['', '', 'a', '', 'b', '', ''].map((data) => root.appendChild(doc.createTextNode(data)));
		const first = nodes[2];

		root.normalize();

		expectChildren(root, [first]);
		expect(first.data).toBe('ab');
		expect(first.nodeValue).toBe('ab');
		expect(first.length).toBe(2);
		expectDetached(nodes.filter((node) => node !== first));
		nodes.slice(1).forEach((node, index) => expect(root.childNodes[index + 1]).toBeUndefined());
		root.normalize();
		expectChildren(root, [first]);
		expect(first.data).toBe('ab');
	});

	test.each([
		['element', (doc) => doc.createElement('boundary')],
		['comment', (doc) => doc.createComment('')],
		['processing instruction', (doc) => doc.createProcessingInstruction('boundary', '')],
		['empty CDATA section', (doc) => doc.createCDATASection('')],
		['CDATA section', (doc) => doc.createCDATASection('cdata')],
	])('%s separates text runs', (name, createBoundary) => {
		const doc = new DOMImplementation().createDocument(null, 'root');
		const root = doc.documentElement;
		const first = doc.createTextNode('a');
		const boundary = createBoundary(doc);
		const last = doc.createTextNode('b');
		const empty = Array.from({ length: 4 }, () => doc.createTextNode(''));
		[empty[0], first, empty[1], boundary, empty[2], last, empty[3]].forEach((node) => root.appendChild(node));

		root.normalize();

		expectChildren(root, [first, boundary, last]);
		expect(first.data).toBe('a');
		expect(last.data).toBe('b');
		expectDetached(empty);
	});

	test.each(['document', 'element', 'document fragment'])('%s normalization reaches nested children', (kind) => {
		const doc = new DOMImplementation().createDocument(null, 'root');
		const root = doc.documentElement;
		const fragment = doc.createDocumentFragment();
		const target = kind === 'document' ? doc : kind === 'element' ? root : fragment;
		if (kind === 'document fragment') fragment.appendChild(root);
		const nested = doc.createElement('nested');
		const empty = [root.appendChild(doc.createTextNode(''))];
		root.appendChild(nested);
		empty.push(root.appendChild(doc.createTextNode('')));
		empty.push(nested.appendChild(doc.createTextNode('')));
		const first = nested.appendChild(doc.createTextNode('a'));
		empty.push(nested.appendChild(doc.createTextNode('')));
		const tail = nested.appendChild(doc.createTextNode('b'));

		target.normalize();

		expectChildren(root, [nested]);
		expectChildren(nested, [first]);
		expect(first.data).toBe('ab');
		expectDetached(empty.concat(tail));
		target.normalize();
		expectChildren(root, [nested]);
		expectChildren(nested, [first]);
		expect(first.data).toBe('ab');
	});
});
