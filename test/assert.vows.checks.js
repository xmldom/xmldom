'use strict'

const vows = require('vows')
const assert = require('assert').strict
const a = require('./assert')

const values = [
	undefined,
	null,
	true,
	false,
	NaN,
	0,
	1,
	Infinity,
	-Infinity,
	'',
	'0',
	'1',
	'true',
	'false',
	'[object Object]',
	'() => {}',
	[],
	{},
	() => {},
]
const describe = (...args) =>
	args
		.map((a) => {
			const type = typeof a
			let str = JSON.stringify(a)
			if (str === undefined) {
				str = String(a)
			}
			return `${type} ${str}`
		})
		.join(', ')

const suite = vows.describe('assert')
values.forEach((actual) => {
	values.forEach((expected) => {
		// `NaN === NaN` and `NaN == NaN` are false so skip NaN as expected
		if (typeof expected === 'number' && isNaN(expected)) return

		if (expected == actual) {
			// actual and expected are loose equal

			if (expected !== actual) {
				// actual and expected are loose equal but not strict equal
				suite.addBatch({
					[`assert(${describe(
						actual,
						expected
					)}) {strictThrows: false} logs`]: () => {
						const logs = []
						const t = {
							strictThrows: () => false,
							log: (...args) => {
								logs.push(args.join(' '))
								// console.warn(...args)
							},
						}
						a.call(t, actual, expected, 'msg1', 'msg2')
						assert.equal(
							logs.length,
							1,
							'expected 1 log entry but was ' + logs.length
						)
						const missing = [
							'(strict ===)',
							'msg1',
							'msg2',
							`${__filename}:`,
						].filter((em) => !logs[0].includes(em))
						assert(
							missing.length === 0,
							`Expected all of [${describe(...missing)}] in '''${logs[0]}'''.`
						)
					},
					[`assert(${describe(
						actual,
						expected
					)}) {strictThrows: true} throws`]: () => {
						const t = {
							strictThrows: () => true,
						}
						// assert.throws doesn't work here since the check is not triggered for AssertionError
						let caught
						try {
							a.call(t, actual, expected, 'msg1', 'msg2')
						} catch (error) {
							caught = error
						}
						assert(
							caught && caught.name.startsWith('AssertionError'),
							'expected an AssertionError to be thrown'
						)
						const missing = [
							'(strict ===)',
							'msg1',
							'msg2',
							`${__filename}:`,
						].filter((em) => !caught.message.includes(em))
						assert(
							missing.length === 0,
							`Expected all of [${describe(...missing)}] in '''${
								caught.message
							}'''.`
						)
					},
					[`assert.skip(${describe(actual, expected)}) logs`]: () => {
						const logs = []
						const t = {
							strictThrows: () => true,
							log: (...args) => {
								logs.push(args.join(' '))
								// console.warn(...args)
							},
						}
						a.skip.call(t, actual, expected, 'msg1', 'msg2')
						assert.equal(
							logs.length,
							1,
							'expected 1 log entry but was ' + logs.length
						)
						const missing = [
							'Skipped',
							'(strict ===)',
							'msg1',
							'msg2',
							`${__filename}:`,
						].filter((em) => !logs[0].includes(em))
						assert(
							missing.length === 0,
							`Expected all of [${describe(...missing)}] in '''${logs[0]}'''.`
						)
					},
				})
			} else {
				// actual and expected are loose and strict equal
				suite.addBatch({
					[`assert.skip(${describe(
						actual,
						expected
					)}) throws since no asssertion fails`]: () => {
						// assert.throws doesn't work here since the check is not triggered for AssertionError
						let caught
						try {
							a.skip(actual, expected, 'msg1', 'msg2')
						} catch (error) {
							caught = error
						}
						assert(caught, 'expected an nError to be thrown')
						const missing = [
							'Skipped',
							'not failing',
							'msg1',
							'msg2',
							`${__filename}:`,
						].filter((em) => !caught.message.includes(em))
						assert(
							missing.length === 0,
							`Expected all of [${describe(...missing)}] in '''${
								caught.message
							}'''.`
						)
					},
				})
			}
		} else {
			// actual and expected are NOT loose equal
			suite.addBatch({
				[`assert(${describe(actual, expected)}) loose fails`]: () => {
					assert.throws(
						() => a(actual, expected, 'msg1', 'msg2'),
						(e) => {
							const check =
								/AssertionError/.test(e.name) &&
								['(loose ==)', 'msg1', 'msg2'].every((em) =>
									e.message.includes(em)
								)
							return check || console.error(e)
						}
					)
				},
				[`assert.skip(${describe(actual, expected)}) logs`]: () => {
					const logs = []
					const t = {
						log: (...args) => {
							logs.push(args.join(' '))
							// console.warn(...args)
						},
					}
					a.skip.call(t, actual, expected, 'msg1', 'msg2')
					assert.equal(
						logs.length,
						1,
						'expected 1 log entry but was ' + logs.length
					)
					const missing = [
						'Skipped',
						'(loose ==)',
						'msg1',
						'msg2',
						`${__filename}:`,
					].filter((em) => !logs[0].includes(em))
					assert(
						missing.length === 0,
						`Expected all of [${describe(...missing)}] in '''${logs[0]}'''.`
					)
				},
			})
		}
	})
})

suite.export(module)
