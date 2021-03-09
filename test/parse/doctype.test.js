'use strict'

const { getTestParser } = require('../get-test-parser')
describe('doctype', () => {
	describe.each(['SYSTEM', 'PUBLIC'])('%s', (idType) => {
		test.each([
			['outer single', `<!DOCTYPE x ${idType} '\"'><X/>`, "'\"'"],
			['outer double', `<!DOCTYPE x ${idType} "\'"><X/>`, '"\'"'],
		])(
			'should parse single line DOCTYPE with mixed quotes (%s)',
			(_, source, idValue) => {
				const { errors, parser } = getTestParser()

				const actual = parser.parseFromString(source).firstChild

				expect({
					[idType]: idType === 'SYSTEM' ? actual.systemId : actual.publicId,
					name: actual.name,
					...errors,
				}).toEqual({
					[idType]: idValue,
					name: 'x',
				})
			}
		)
	})
})
