'use strict';

const { getTestParser } = require('../get-test-parser');
const { MIME_TYPE } = require('../../lib/conventions');

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
