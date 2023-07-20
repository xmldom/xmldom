'use strict';

const { describe, expect, test } = require('@jest/globals');
const { NodeList, LiveNodeList, DOMImplementation } = require('../../lib/dom');

describe('NodeList', () => {
	describe('item', () => {
		test('should return null for items outside length', () => {
			const it = new NodeList();
			expect(it.length).toBe(0);
			expect(it.item(-1)).toBe(null);
			expect(it.item(0)).toBe(null);
		});
		test('should return item for existing item', () => {
			const it = new NodeList();
			const item = {};
			it[0] = item;
			it.length = 1;
			expect(it.item(0)).toBe(item);
		});
	});
});

describe('_updateLiveList', () => {
	test('should remove item from LiveNodeList after length is reduced', () => {
		const doc = new DOMImplementation().createDocument(null, 'xml');
		const node = doc.createElement('listNode');
		const child = doc.createElement('child');
		node.appendChild(child);
		const refresh = jest.fn(() => [child]);
		const list = new LiveNodeList(node, refresh);
		expect(list[0]).toBe(child);
		expect(list.length).toBe(1);
		expect(refresh).toHaveBeenCalledTimes(1);

		doc._inc++;
		expect(list.item(0)).toBe(child);
		expect(refresh).toHaveBeenCalledTimes(2);
		expect(list[0]).toBe(child);
		expect(list.length).toBe(1);

		refresh.mockReturnValueOnce([]);
		doc._inc++;
		expect(list.item(0)).toBe(null);
		expect(refresh).toHaveBeenCalledTimes(3);
		expect(list[0]).toBe(undefined);
		expect(list.length).toBe(0);
	});
});
