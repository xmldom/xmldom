'use strict';

const { DOMImplementation } = require('../../lib');

describe('replaceChild result and identity', () => {
	const makeParent = (kind) => {
		const doc = new DOMImplementation().createDocument(null, 'root', null);
		if (kind === 'document') return [doc, doc.documentElement];
		const parent = kind === 'fragment' ? doc.createDocumentFragment() : doc.documentElement;
		const child = parent.appendChild(doc.createElement('old'));
		return [parent, child];
	};

	test.each(['document', 'element', 'fragment'])('returns the replaced child for a %s', (kind) => {
		const [parent, oldChild] = makeParent(kind);
		const doc = oldChild.ownerDocument;
		const newChild = doc.createElement('new');
		expect(parent.replaceChild(newChild, oldChild)).toBe(oldChild);
		expect(oldChild.parentNode).toBeNull();
		expect(parent.firstChild).toBe(newChild);
		expect(parent.lastChild).toBe(newChild);
		expect(Array.from(parent.childNodes)).toEqual([newChild]);
	});

	test.each(['document', 'element', 'fragment'])('preserves a child replaced with itself in a %s', (kind) => {
		const [parent, child] = makeParent(kind);
		const before = parent.toString();
		expect(parent.replaceChild(child, child)).toBe(child);
		expect(parent.toString()).toBe(before);
		expect(child.parentNode).toBe(parent);
		expect(parent.firstChild).toBe(child);
		expect(parent.lastChild).toBe(child);
		expect(child.nextSibling).toBeNull();
		expect(child.previousSibling).toBeNull();
		expect(Array.from(parent.childNodes)).toEqual([child]);
		if (kind === 'document') expect(parent.documentElement).toBe(child);
	});

	test('self replacement still rejects a child of another parent', () => {
		const [parent, child] = makeParent('element');
		const other = child.ownerDocument.createElement('other');
		expect(() => other.replaceChild(child, child)).toThrow(expect.objectContaining({ name: 'NotFoundError' }));
		expect(child.parentNode).toBe(parent);
	});

	test('replacing with an existing sibling maintains links and returns the old child', () => {
		const [parent, oldChild] = makeParent('element');
		const doc = oldChild.ownerDocument;
		const sibling = parent.appendChild(doc.createElement('sibling'));
		const tail = parent.appendChild(doc.createElement('tail'));
		expect(parent.replaceChild(sibling, oldChild)).toBe(oldChild);
		expect(Array.from(parent.childNodes)).toEqual([sibling, tail]);
		expect(sibling.previousSibling).toBeNull();
		expect(sibling.nextSibling).toBe(tail);
		expect(tail.previousSibling).toBe(sibling);
	});
});
