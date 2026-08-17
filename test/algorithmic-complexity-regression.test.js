'use strict';

/**
 * Regression guards for the CWE-407 weakness class (Inefficient Algorithmic
 * Complexity) and its ReDoS child CWE-1333.
 *
 *   {@link https://cwe.mitre.org/data/definitions/407.html CWE-407 Inefficient Algorithmic Complexity}
 *   {@link https://cwe.mitre.org/data/definitions/1333.html CWE-1333 Inefficient Regular Expression Complexity}
 *
 * Each guard drives a public seam (`DOMParser#parseFromString`, `Node#normalize`,
 * `NamedNodeMap`) with an attack-shaped input and asserts the fixed asymptotic
 * behaviour as a hard pass/fail — never inspecting private state (index shape,
 * regex form, or state-machine internals). A re-introduced super-linear path
 * fails these tests.
 *
 * Group `describe`s by CWE. Where a super-linear cost is a transient allocation
 * peak that GC releases (so it cannot be sampled in-process), the guard runs the
 * parse in a child node process constrained to a small old-space heap: the
 * quadratic input exhausts that budget and the child crashes, the linear fix
 * completes — the same constrained-resource / fixed-workload shape the
 * CWE-674 recursion guard uses for stack depth.
 *
 * See test/README.md "Weakness-class guards" for the convention.
 */

const { describe, test, expect } = require('@jest/globals');
const { spawnSync } = require('child_process');
const path = require('path');

const LIB = path.resolve(__dirname, '..', 'lib');

/**
 * Runs `script` in a child node process whose V8 old-space is capped at `heapMb` megabytes,
 * and reports whether it completed within that budget.
 *
 * @param {string} script
 * Source passed to `node -e`.
 * @param {number} heapMb
 * Old-space cap in MB (`--max-old-space-size`).
 * @returns {{ ok: boolean; status: number | null; stderr: string }}
 * `ok` is `true` iff the child exited 0 (parse fit the heap budget).
 */
function runUnderHeapCap(script, heapMb) {
	const res = spawnSync(process.execPath, ['--max-old-space-size=' + heapMb, '-e', script], {
		encoding: 'utf8',
	});
	return { ok: res.status === 0, status: res.status, stderr: res.stderr || '' };
}

/**
 * Builds a `node -e` script that parses a document nesting `depth` elements,
 * each declaring and using one unique namespace prefix — the GHSA-965w input.
 *
 * @param {number} depth
 * Nesting depth / number of distinct namespace prefixes.
 * @returns {string}
 */
function nsMapBombScript(depth) {
	return [
		'var DOMParser = require(' + JSON.stringify(LIB) + ').DOMParser;',
		'var open = "", close = "";',
		'for (var i = 0; i < ' + depth + '; i++) {',
		'  open += "<n" + i + ":a xmlns:n" + i + "=\\"urn:x:" + i + "\\">";',
		'  close = "</n" + i + ":a>" + close;',
		'}',
		'new DOMParser().parseFromString("<root>" + open + "leaf" + close + "</root>", "text/xml");',
	].join('\n');
}

describe('CWE-407 Inefficient Algorithmic Complexity', () => {
	describe('quadratic namespace-map memory during parse (GHSA-965w-775f-mr7g)', () => {
		// Unfixed: `appendElement` flat-copies the whole in-scope namespace map for
		// every element that declares a prefix, so a document nesting N unique
		// prefixes retains sum(1..N) = O(N^2) map entries at peak during parse and
		// exhausts a small heap. Fixed: each scope's map inherits its parent via the
		// prototype chain (O(1) own entries per element) so peak stays O(N).
		//
		// Calibrated on node 18: unfixed OOMs by depth 3000 under a 128 MB old-space;
		// the linear fix parses depth 5000 in ~14 MB. The wide margin (quadratic peak
		// ~hundreds of MB vs linear ~tens of MB) keeps the pass/fail stable across
		// machines despite the absolute cap.
		const DEPTH = 5000;
		const HEAP_MB = 128;

		test('a deeply namespaced document parses within a constrained heap', () => {
			const res = runUnderHeapCap(nsMapBombScript(DEPTH), HEAP_MB);
			expect(res.ok).toBe(true);
		});
	});
});
