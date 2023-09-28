'use strict';

const { describe, expect, test } = require('@jest/globals');
const { Char, Name, reg, PI } = require('../../lib/grammar');

describe('PI', () => {
	test('should contain Name', () => {
		expect(PI.source.split(Name.source)).toHaveLength(2);
	});
	test('should contain Char', () => {
		expect(PI.source.split(Char.source)).toHaveLength(2);
	});
	[
		`<?xml version="1.0"?>`,
		`<?xml version="1.0" ?>`,
		`<?xml version="1.1" ?>`,
		`<?xml version="1.0" encoding="A"?>`,
		`<?xml version="1.0" encoding="A-A-Za-z0-9._"?>`,
		`<?xml version="1.0" encoding="a" ?>`,
		`<?xml version="1.0" encoding='A' ?>`,
		`<?xml version="1.0" encoding="A" standalone="yes" ?>`,
		`<?xml version="1.0" encoding="A" standalone='no'?>`,
		`<?xml version="1.0" standalone='yes'?>`,
		`<?xml\n \r\tversion="1.1"\n \r\tencoding="A"\n \r\tstandalone="yes"\n \r\t?>`,
	].forEach((valid) =>
		test(`should match XMLDecl ${valid}`, () => {
			expect(PI.exec(valid)[0]).toBe(valid);
		})
	);
	[`<?xml?>`, `<?target\n\t\r ?>`].forEach((valid) =>
		test(`should match ${valid}`, () => {
			expect(PI.exec(valid)[0]).toBe(valid);
		})
	);
	test(`should not be greedy`, () => {
		const long_example = `<?target anything is allowed here as long as ? and > are not beside each other like this:\t\n?>`;
		const actual = PI.exec(long_example + long_example);
		expect(actual[0]).toHaveLength(long_example.length);
		expect(actual).toMatchSnapshot();
	});
	test(`should drop initial white-space but keep ending white-space`, () => {
		const example = `<?target\n\t\r 0-9\r \n\t?>`;
		const actual = PI.exec(example);
		expect(actual[0]).toHaveLength(example.length);
		expect(actual[2]).toBe(`0-9\r \n\t`);
	});
	['< ?xml version="1.0"?>', '<? xml version="1.0"?>'].forEach((invalid) =>
		test(`should not match ${invalid}`, () => {
			expect(reg(PI).test(invalid)).toBe(false);
		})
	);
});
