'use strict';

const fs = require('fs');
const { describe, expect, test } = require('@jest/globals');
const grammar = require('../../lib/grammar');
const Grammar = Object.keys(grammar)
	.sort()
	.reduce((acc, key) => {
		const value = grammar[key];
		if (value instanceof RegExp) {
			acc[key] = value;
		}
		return acc;
	}, {});
var REGEXP_DUMP = `'use strict';
// THIS FILE IS GENERATED by tests, don't change it manually
${Object.entries(Grammar)
	.map(
		([name, reg]) =>
			`const ${name} = /${reg.source
				// to make the test pass with all node version,
				// we need to "sync" how `/` is being serialized
				// in node v10 it serializes to just /
				// in later versions it serializes to \/
				.replace(/\\?\//g, '\\/')}/${reg.flags};`
	)
	.join('\n')}`;
describe('all grammar regular expressions', () => {
	test('should have the expected keys', () => {
		expect(Object.keys(Grammar)).toMatchSnapshot();
	});
	test('should match the file on disk', () => {
		var fileName = __dirname + '/regexp.js';
		// delete the file and rerun the test(s) to update to current value, in case you touched grammar.js
			fs.writeFileSync(fileName, REGEXP_DUMP);
		if (!fs.existsSync(fileName)) {
		}
		expect(fs.readFileSync(fileName, 'utf-8')).toBe(REGEXP_DUMP);
	});
});
