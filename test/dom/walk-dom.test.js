'use strict';

const { describe, test, expect, beforeEach } = require('@jest/globals');
const { DOMImplementation, walkDOM } = require('../../lib/dom');

/**
 * Build a small DOM tree for testing:
 *
 *   root (Element)
 *     childA (Element)
 *       grandchildA1 (Element)
 *       grandchildA2 (Element)
 *     childB (Element)
 *       grandchildB1 (Element)
 */
function buildTree() {
	const impl = new DOMImplementation();
	const doc = impl.createDocument(null, 'root');
	const root = doc.documentElement;

	const childA = doc.createElement('childA');
	root.appendChild(childA);
	const grandchildA1 = doc.createElement('grandchildA1');
	childA.appendChild(grandchildA1);
	const grandchildA2 = doc.createElement('grandchildA2');
	childA.appendChild(grandchildA2);
	const childB = doc.createElement('childB');
	root.appendChild(childB);
	const grandchildB1 = doc.createElement('grandchildB1');
	childB.appendChild(grandchildB1);

	return { doc, root, childA, grandchildA1, grandchildA2, childB, grandchildB1 };
}

describe('walkDOM', () => {
	describe('pre-order entry', () => {
		test('calls enter on parent before children', () => {
			const { root } = buildTree();
			const visited = [];
			walkDOM(root, null, {
				enter(node) {
					visited.push(node.nodeName);
					// Descend into root so childA/childB are visited, but skip grandchildren
					if (node === root) return 'ctx';
					return null;
				},
			});
			// root entered first; childA and childB entered; grandchildren skipped
			expect(visited).toEqual(['root', 'childA', 'childB']);
		});

		test('visits all nodes in depth-first pre-order when enter returns a truthy context', () => {
			const { root } = buildTree();
			const visited = [];
			walkDOM(root, 'ctx', {
				enter(node) {
					visited.push(node.nodeName);
					return 'ctx';
				},
			});
			expect(visited).toEqual(['root', 'childA', 'grandchildA1', 'grandchildA2', 'childB', 'grandchildB1']);
		});
	});

	describe('post-order exit', () => {
		test('calls exit on a node after all its children have been exited', () => {
			const { root } = buildTree();
			const log = [];
			walkDOM(root, 'ctx', {
				enter(node) {
					log.push('enter:' + node.nodeName);
					return 'ctx';
				},
				exit(node) {
					log.push('exit:' + node.nodeName);
				},
			});
			// grandchildA1 exited before childA, childA exited before root
			const grandchildA1Exit = log.indexOf('exit:grandchildA1');
			const childAExit = log.indexOf('exit:childA');
			const rootExit = log.indexOf('exit:root');
			expect(grandchildA1Exit).toBeLessThan(childAExit);
			expect(childAExit).toBeLessThan(rootExit);
		});

		test('passes the context returned by enter to exit', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument(null, 'root');
			const root = doc.documentElement;
			root.appendChild(doc.createElement('child'));

			const exitContexts = [];
			walkDOM(root, 0, {
				enter(node, ctx) {
					return ctx + 1;
				},
				exit(node, ctx) {
					exitContexts.push({ name: node.nodeName, ctx });
				},
			});
			// root enter gets ctx=0, returns 1; child enter gets ctx=1, returns 2
			// child exit gets ctx=2; root exit gets ctx=1
			expect(exitContexts).toEqual([
				{ name: 'child', ctx: 2 },
				{ name: 'root', ctx: 1 },
			]);
		});
	});

	describe('context propagation', () => {
		test('each child receives the return value of its parent enter', () => {
			const { root } = buildTree();
			const receivedCtx = {};
			walkDOM(root, 0, {
				enter(node, ctx) {
					receivedCtx[node.nodeName] = ctx;
					return ctx + 1;
				},
			});
			expect(receivedCtx['root']).toBe(0);
			expect(receivedCtx['childA']).toBe(1);
			expect(receivedCtx['grandchildA1']).toBe(2);
			expect(receivedCtx['grandchildA2']).toBe(2);
			expect(receivedCtx['childB']).toBe(1);
			expect(receivedCtx['grandchildB1']).toBe(2);
		});
	});

	describe('STOP sentinel', () => {
		test('returning walkDOM.STOP from enter aborts the entire traversal immediately', () => {
			const { root } = buildTree();
			const visited = [];
			walkDOM(root, null, {
				enter(node) {
					visited.push(node.nodeName);
					if (node.nodeName === 'childA') {
						return walkDOM.STOP;
					}
					return 'ctx';
				},
				exit(node) {
					visited.push('exit:' + node.nodeName);
				},
			});
			// root and childA entered; traversal stops at childA — no children of childA,
			// no siblings (childB), no exit calls
			expect(visited).toEqual(['root', 'childA']);
		});
	});

	describe('skip children', () => {
		test('returning null from enter skips children but continues with siblings', () => {
			const { root } = buildTree();
			const visited = [];
			walkDOM(root, null, {
				enter(node) {
					visited.push(node.nodeName);
					if (node.nodeName === 'childA') {
						return null; // skip grandchildA1, grandchildA2
					}
					return 'ctx';
				},
			});
			expect(visited).toContain('root');
			expect(visited).toContain('childA');
			expect(visited).not.toContain('grandchildA1');
			expect(visited).not.toContain('grandchildA2');
			// childB and its child are still walked (null only skips childA's children)
			expect(visited).toContain('childB');
			expect(visited).toContain('grandchildB1');
		});

		test('returning undefined from enter skips children but continues with siblings', () => {
			const { root } = buildTree();
			const visited = [];
			walkDOM(root, null, {
				enter(node) {
					visited.push(node.nodeName);
					if (node.nodeName === 'childA') {
						return undefined; // skip grandchildA1, grandchildA2
					}
					return 'ctx';
				},
			});
			expect(visited).toContain('root');
			expect(visited).toContain('childA');
			expect(visited).not.toContain('grandchildA1');
			expect(visited).not.toContain('grandchildA2');
			// childB and its child are still walked (undefined only skips childA's children)
			expect(visited).toContain('childB');
			expect(visited).toContain('grandchildB1');
		});
	});

	describe('enter modifies firstChild before descent', () => {
		test('walker visits the modified child list when enter adds a child before returning', () => {
			const impl = new DOMImplementation();
			const doc = impl.createDocument(null, 'root');
			const root = doc.documentElement;
			const original = doc.createElement('original');
			root.appendChild(original);

			const visited = [];
			walkDOM(root, null, {
				enter(node) {
					visited.push(node.nodeName);
					if (node.nodeName === 'root') {
						// Add a new child before returning — walker should see it
						root.appendChild(doc.createElement('added'));
					}
					return 'ctx';
				},
			});
			expect(visited).toContain('added');
		});
	});
});
