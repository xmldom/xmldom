'use strict'

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
 * Where a super-linear cost is a transient allocation peak that GC releases (so
 * it cannot be sampled in-process), the guard runs the parse in a child node
 * process constrained to a small old-space heap: the quadratic input exhausts
 * that budget and the child crashes, the linear fix completes — the same
 * constrained-resource / fixed-workload shape the CWE-674 recursion guard uses
 * for stack depth.
 */

const { describe, test, expect } = require('@jest/globals')
const { spawnSync } = require('child_process')
const path = require('path')
const { DOMParser, DOMImplementation } = require('../lib')

const LIB = path.resolve(__dirname, '..', 'lib')

/**
 * Returns the fastest wall-clock (ms) of `runs` executions of `fn` — the minimum
 * is the least noise-inflated sample, so a growth ratio built from two such
 * measurements is stable across fast and slow hosts.
 *
 * @param fn {() => void}
 * @param runs {number}
 * @returns {number}
 */
function fastestMs(fn, runs) {
	var best = Infinity
	for (var k = 0; k < runs; k++) {
		var t = process.hrtime.bigint()
		fn()
		var d = Number(process.hrtime.bigint() - t) / 1e6
		if (d < best) best = d
	}
	return best
}

/**
 * Runs `script` in a child node process whose V8 old-space is capped at `heapMb`
 * megabytes, and reports whether it completed within that budget.
 *
 * @param script {string} Source passed to `node -e`.
 * @param heapMb {number} Old-space cap in MB (`--max-old-space-size`).
 * @returns {{ ok: boolean, status: number | null, stderr: string }}
 * `ok` is `true` iff the child exited 0 (parse fit the heap budget).
 */
function runUnderHeapCap(script, heapMb) {
	const res = spawnSync(
		process.execPath,
		['--max-old-space-size=' + heapMb, '-e', script],
		{ encoding: 'utf8' }
	)
	return { ok: res.status === 0, status: res.status, stderr: res.stderr || '' }
}

/**
 * Builds a `node -e` script that parses a document nesting `depth` elements, each
 * declaring and using one unique namespace prefix — the GHSA-965w input.
 *
 * @param depth {number} Nesting depth / number of distinct namespace prefixes.
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
	].join('\n')
}

describe('CWE-407 Inefficient Algorithmic Complexity', () => {
	describe('quadratic namespace-map memory during parse (GHSA-965w-775f-mr7g)', () => {
		// Unfixed: `appendElement` flat-copies the whole in-scope namespace map for
		// every element that declares a prefix, so a document nesting N unique
		// prefixes retains sum(1..N) = O(N^2) map entries at peak during parse and
		// exhausts a small heap. Fixed: each scope's map inherits its parent via the
		// prototype chain (O(1) own entries per element) so peak stays O(N).
		//
		// Calibrated on node 18: unfixed OOMs by depth 2000 under a 128 MB old-space;
		// the linear fix parses depth 5000 in ~9 MB. The wide margin keeps the
		// pass/fail stable across machines despite the absolute cap.
		const DEPTH = 5000
		const HEAP_MB = 128

		test('a deeply namespaced document parses within a constrained heap', () => {
			const res = runUnderHeapCap(nsMapBombScript(DEPTH), HEAP_MB)
			expect(res.ok).toBe(true)
		})
	})

	describe('quadratic attribute de-duplication during parse (GHSA-8344-3jmq-59r6)', () => {
		// Unfixed: `DOMHandler.startElement` inserts each of M attributes via
		// `setAttributeNode`, and every insert runs a linear membership scan of the
		// already-inserted attributes (`setNamedItem` -> `getNamedItem`), so a single
		// well-formed element carrying M distinct attributes costs 1+2+...+M = O(M^2).
		// Fixed: a null-prototype membership index makes each insert O(1) -> O(M) total.
		//
		// Growth ratio over a 4x increase in M: quadratic ~16x, linear ~4x. Calibrated
		// on node 18, the unfixed scan measures ~17.7x; the threshold of 8 (the log-space
		// midpoint) separates the two with headroom and holds on slow CI.
		const M1 = 4000
		const M2 = 16000 // 4x M1
		const RATIO_MAX = 8

		function attrBomb(m) {
			var parts = new Array(m)
			for (var i = 0; i < m; i++) parts[i] = 'a' + i + '="x"'
			return '<r ' + parts.join(' ') + '/>'
		}

		test('an element with many distinct attributes de-duplicates in sub-quadratic time', () => {
			const xml1 = attrBomb(M1)
			const xml2 = attrBomb(M2)
			const t1 = fastestMs(
				() => new DOMParser().parseFromString(xml1, 'text/xml'),
				5
			)
			const t2 = fastestMs(
				() => new DOMParser().parseFromString(xml2, 'text/xml'),
				5
			)
			expect(t2 / t1).toBeLessThan(RATIO_MAX)
		})
	})

	describe('CWE-1333 end-tag trailing-whitespace trim ReDoS (GHSA-x4fp-j954-r2f4)', () => {
		// Unfixed: the end-tag name trim used an unanchored global regex `/[ \t\n\r]+$/g`.
		// On a name shaped `whitespace-run + one non-whitespace char` (an end tag
		// `</   …   x>`), the engine extends `[ws]+` to the end from every start position
		// and then fails the `$` anchor — O(n^2) backtracking in the whitespace-run
		// length. Fixed: an anchored trim runs in linear time.
		//
		// The attack input is compared against a benign same-size input (whitespace as
		// text content, which never triggers the trim's backtracking). Unfixed the ratio
		// is ~1300x+ and grows with size; fixed both are linear, so the ratio collapses.
		// The threshold of 100 leaves an order of magnitude of headroom on each side and
		// scales with host speed (both measurements do).
		const N = 64 * 1024
		const RATIO_MAX = 100

		function tryParse(xml) {
			try {
				new DOMParser().parseFromString(xml, 'text/xml')
			} catch (e) {
				// malformed end tags may report/throw; timing is what matters here
			}
		}

		test('an end tag with a long trailing-whitespace run trims in near-linear time', () => {
			const attack = '<r></' + ' '.repeat(N) + 'x>'
			const benign = '<r>' + ' '.repeat(N) + '</r>'
			const attackMs = fastestMs(() => tryParse(attack), 3)
			const benignMs = fastestMs(() => tryParse(benign), 3)
			expect(attackMs / Math.max(benignMs, 1)).toBeLessThan(RATIO_MAX)
		})
	})

	describe('quadratic malformed-tag recovery re-scan and normalize (GHSA-93r5-fhx6-vmg9)', () => {
		// Growth ratio over a 4x increase in size: quadratic ~16x, linear ~4x. The wide
		// 4x spread keeps the two well apart despite timing noise; the threshold of 8
		// separates them.
		const RATIO_MAX = 8
		// A silent errorHandler avoids flooding the console with the reported candidate
		// on the (unfixed) quadratic path; parsing behaviour is unchanged.
		const silent = function () {}

		function parse(xml, mime) {
			try {
				new DOMParser({ errorHandler: silent }).parseFromString(xml, mime)
			} catch (e) {
				// default recovery reports (does not throw); timing is what matters
			}
		}

		// Finding A: each interior `<` starting a malformed tag used to re-scan forward
		// to the distant `>`, and one-character recovery repeated that O(n) times -> O(n^2).
		// The `<`-in-tag-name guard bounds each re-scan, so parse time is linear.
		test('Finding A: a malformed tag full of `<` parses in near-linear time', () => {
			const build = (n) => '<r>' + 'a<'.repeat(n) + '</r>'
			const t1 = fastestMs(() => parse(build(4000), 'text/xml'), 3)
			const t2 = fastestMs(() => parse(build(16000), 'text/xml'), 3)
			expect(t2 / t1).toBeLessThan(RATIO_MAX)
		})

		// Finding B (parse-triggered): recovery emits one single-character text node per
		// recovered character, so a parent gathers K adjacent text siblings that
		// `endDocument`'s `normalize()` used to merge in O(K^2). The O(K) merge keeps it
		// linear. `a<>` keeps each re-scan short so the cost isolates to `normalize()`.
		test('Finding B: parse-triggered adjacent-text normalize is near-linear', () => {
			const build = (n) => '<r>' + 'a<>'.repeat(n) + '</r>'
			const t1 = fastestMs(() => parse(build(4000), 'text/html'), 3)
			const t2 = fastestMs(() => parse(build(16000), 'text/html'), 3)
			expect(t2 / t1).toBeLessThan(RATIO_MAX)
		})

		// Finding B (programmatic): the same O(K) normalize applies to a DOM built with
		// createTextNode + appendChild, which no parser-side change would cover.
		test('Finding B: programmatic adjacent-text normalize is near-linear', () => {
			function normalizeK(k) {
				const doc = new DOMImplementation().createDocument(null, 'r')
				const root = doc.documentElement
				for (var i = 0; i < k; i++) root.appendChild(doc.createTextNode('x'))
				root.normalize()
			}
			const t1 = fastestMs(() => normalizeK(2000), 3)
			const t2 = fastestMs(() => normalizeK(8000), 3)
			expect(t2 / t1).toBeLessThan(RATIO_MAX)
		})
	})
})
