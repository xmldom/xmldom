'use strict';

/**
 * Regression guard for the CWE-674 weakness class, on the control-flow branch
 * (CWE-674 -> CWE-834 Excessive Iteration -> CWE-691), separate from the
 * resource-consumption DoS family (CWE-400 subtree).
 *
 *   {@link https://cwe.mitre.org/data/definitions/674.html CWE-674 Uncontrolled Recursion}
 *
 * Published as GHSA-2v35-w6hq-6mfw. DOM traversals must stay iterative: a
 * re-introduced recursive tree walk overflows the (deliberately small)
 * configured V8 stack and fails these tests.
 *
 * See test/README.md "Security / DoS regression guards" for the convention.
 */

const { describe, test, expect, beforeAll } = require('@jest/globals');
const { DOMImplementation, walkDOM } = require('../lib/dom');
const { XMLSerializer } = require('../lib');
const pkgJson = require('../package.json');

// Must exceed the recursive-overflow threshold at the configured stack size
// (<3000 frames at 256 KB across tested node versions)
// so that re-introducing any recursive tree walk
// causes these tests to fail.
const DEEP_TREE_DEPTH = 3000;

test('npm_package_config_test_stack_size env var matches package.json config.test_stack_size', () => {
	expect(process.env.npm_package_config_test_stack_size).toBe(`${pkgJson.config.test_stack_size}`);
});
test('test script uses $npm_package_config_test_stack_size', () => {
	expect(pkgJson.scripts.test).toMatch(' --stack-size=$npm_package_config_test_stack_size');
});
test('recursive function overflows within DEEP_TREE_DEPTH frames', () => {
	function throwsAtLevel(lvl = 0) {
		const nextLvl = lvl + 1;
		try {
			return throwsAtLevel(nextLvl);
		} catch {
			return nextLvl;
		}
	}
	expect(throwsAtLevel()).toBeLessThanOrEqual(DEEP_TREE_DEPTH);
});

describe('deep tree stack overflow guard (GHSA-2v35-w6hq-6mfw)', () => {
	let deepRoot;
	beforeAll(() => {
		const doc = new DOMImplementation().createDocument(null, 'root');
		let current = doc.documentElement;
		for (let i = 0; i < DEEP_TREE_DEPTH; i++) {
			const child = doc.createElement('n');
			current.appendChild(child);
			current = child;
		}
		deepRoot = doc.documentElement;
	});

	test('walkDOM', () => {
		expect(() =>
			walkDOM(deepRoot, null, {
				enter() {
					return 'ctx';
				},
			})
		).not.toThrow();
	});
	test('getElementsByTagName', () => {
		expect(() => deepRoot.getElementsByTagName('n')).not.toThrow();
	});
	test('textContent', () => {
		expect(() => void deepRoot.textContent).not.toThrow();
	});
	test('serializeToString', () => {
		expect(() => new XMLSerializer().serializeToString(deepRoot)).not.toThrow();
	});
	test('cloneNode(true)', () => {
		expect(() => deepRoot.cloneNode(true)).not.toThrow();
	});
	test('importNode(node, true)', () => {
		const destDoc = new DOMImplementation().createDocument(null, 'dest');
		expect(() => destDoc.importNode(deepRoot, true)).not.toThrow();
	});
	test('normalize', () => {
		expect(() => deepRoot.normalize()).not.toThrow();
	});
	test('isEqualNode', () => {
		// cloneNode is already iterative — use it to build the matching second tree
		const deepClone = deepRoot.cloneNode(true);
		expect(() => deepRoot.isEqualNode(deepClone)).not.toThrow();
	});
});
