'use strict';

/**
 * Scope: prototype-chain safety of the entity lookup tables — the
 * prototype-pollution weakness family, CWE-1321.
 *
 *   {@link https://cwe.mitre.org/data/definitions/1321.html CWE-1321 Prototype Pollution}
 *
 * The XML/HTML entity maps must expose no `prototype`/`__proto__`, and entity
 * resolution must never resolve names inherited from `Object.prototype`
 * (e.g. `&hasOwnProperty;`, `&__proto__;`, `&constructor;`). Added with the
 * prototype-clash fix (#554).
 *
 * See test/README.md for the weakness-scope comment convention.
 */

const { describe, expect, test } = require('@jest/globals');
const { getTestParser } = require('./get-test-parser');
const { MIME_TYPE } = require('../lib/conventions');
const { HTML_ENTITIES, XML_ENTITIES } = require('../lib/entities');

describe('XML_ENTITIES', () => {
	test('should not have a prototype', () => {
		expect(XML_ENTITIES).not.toHaveProperty('prototype');
		expect(XML_ENTITIES).not.toHaveProperty('__proto__');
	});
});
describe('HTML_ENTITIES', () => {
	test('should not have a prototype', () => {
		expect(HTML_ENTITIES).not.toHaveProperty('prototype');
		expect(HTML_ENTITIES).not.toHaveProperty('__proto__');
	});
});
describe('entity replacement ignores js prototype chain', () => {
	test("should not pick up 'entities' from the prototype chain", () => {
		const source = `
		<xml>
			<hasOwnProperty>&hasOwnProperty;</hasOwnProperty> 
			<proto>&__proto__;</proto> 
			<constructor>&constructor;</constructor>
		</xml>
`;
		const { errors, parser } = getTestParser();

		const actual = parser.parseFromString(source, MIME_TYPE.XML_TEXT).toString();

		expect({ actual, ...(errors.length ? { errors } : undefined) }).toMatchSnapshot();
	});
});
