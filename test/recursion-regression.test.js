'use strict'

const { describe, test, expect, beforeAll } = require('@jest/globals')
const { DOMImplementation, walkDOM } = require('../lib/dom')
const { XMLSerializer } = require('../lib')
const pkgJson = require('../package.json')

// Must exceed the recursive-overflow threshold at the configured stack size
// (~2,600 frames at 256 KB) so that re-introducing any recursive tree walk
// causes these tests to fail.
const DEEP_TREE_DEPTH = 3000

test('npm_package_config_test_stack_size env var matches package.json config.test_stack_size', () => {
	expect(process.env.npm_package_config_test_stack_size).toBe(
		`${pkgJson.config.test_stack_size}`
	)
})
test('test script uses $npm_package_config_test_stack_size', () => {
	expect(pkgJson.scripts.test).toMatch(
		' --stack-size=$npm_package_config_test_stack_size'
	)
})
test('recursive function overflows within DEEP_TREE_DEPTH frames', () => {
	function throwsAtLevel(lvl) {
		var nextLvl = (lvl || 0) + 1
		try {
			return throwsAtLevel(nextLvl)
		} catch (e) {
			return nextLvl
		}
	}
	expect(throwsAtLevel()).toBeLessThanOrEqual(DEEP_TREE_DEPTH)
})

describe('deep tree stack overflow guard (GHSA-2v35-w6hq-6mfw)', () => {
	var deepRoot
	beforeAll(() => {
		var doc = new DOMImplementation().createDocument(null, 'root')
		var current = doc.documentElement
		for (var i = 0; i < DEEP_TREE_DEPTH; i++) {
			var child = doc.createElement('n')
			current.appendChild(child)
			current = child
		}
		deepRoot = doc.documentElement
	})

	test('walkDOM', () => {
		expect(() =>
			walkDOM(deepRoot, null, {
				enter: function () {
					return 'ctx'
				},
			})
		).not.toThrow()
	})
	test('getElementsByTagName', () => {
		expect(() => deepRoot.getElementsByTagName('n')).not.toThrow()
	})
	test('textContent', () => {
		expect(() => void deepRoot.textContent).not.toThrow()
	})
	test('serializeToString', () => {
		expect(() => new XMLSerializer().serializeToString(deepRoot)).not.toThrow()
	})
	test('cloneNode(true)', () => {
		expect(() => deepRoot.cloneNode(true)).not.toThrow()
	})
	test('importNode(node, true)', () => {
		var destDoc = new DOMImplementation().createDocument(null, 'dest')
		expect(() => destDoc.importNode(deepRoot, true)).not.toThrow()
	})
	test('normalize', () => {
		expect(() => deepRoot.normalize()).not.toThrow()
	})
})
