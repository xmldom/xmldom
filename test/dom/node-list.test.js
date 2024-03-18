'use strict';

const { describe, expect, test } = require('@jest/globals');
const { NodeList, LiveNodeList, DOMImplementation, Element } = require('../../lib/dom');
const { INTERNAL_SYMBOL } = require('../../lib/conventions');

describe('NodeList', () => {
	describe('Iterator', () => {
		test('should iterate over 3/3 items when using a for...of loop without interruption', () => {
			const it = new NodeList();
			const first = new Element(INTERNAL_SYMBOL);
			it[0] = first;
			const second = new Element(INTERNAL_SYMBOL);
			it[1] = second;
			const third = new Element(INTERNAL_SYMBOL);
			it[2] = third;
			it.length = 3;

			let count = 0;
			for (const _item of it) {
				count++;
			}
			expect(count).toBe(it.length);
		});
		test('should iterate over 1/3 items when using a for...of loop and breaking after first iteration', () => {
			const it = new NodeList();
			const first = new Element(INTERNAL_SYMBOL);
			it[0] = first;
			const second = new Element(INTERNAL_SYMBOL);
			it[1] = second;
			const third = new Element(INTERNAL_SYMBOL);
			it[2] = third;
			it.length = 3;

			let count = 0;
			for (const _item of it) {
				count++;
				break;
			}
			expect(count).toBe(1);
		});
		test('should iterate over 3/3 items when using two for...of loops subsequently', () => {
			const it = new NodeList();
			const first = new Element(INTERNAL_SYMBOL);
			it[0] = first;
			const second = new Element(INTERNAL_SYMBOL);
			it[1] = second;
			const third = new Element(INTERNAL_SYMBOL);
			it[2] = third;
			it.length = 3;

			let firstCount = 0;
			for (const _item of it) {
				firstCount++;
			}
			let secondCount = 0;
			for (const _item of it) {
				secondCount++;
			}

			expect(firstCount).toBe(it.length);
			expect(secondCount).toBe(it.length);
		});
	});
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
