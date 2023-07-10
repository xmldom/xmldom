'use strict';

const { describe, expect, test } = require('@jest/globals');
const { reg, XMLDecl } = require('../../lib/grammar');

describe('XMLDecl', () => {
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
		test(`should match ${valid}`, () => {
			expect(XMLDecl.exec(valid)[0]).toBe(valid);
		})
	);
	[
		'< ?xml version="1.0"?>',
		'<? xml version="1.0"?>',
		'<?xml version="1.0"? >',
		'<?xml version="1."?>',
		'<?xml version="1."?>',
		`<?xml version="1.0" standalone='no' encoding="A" ?>`,
	].forEach((invalid) =>
		test(`should not match ${invalid}`, () => {
			expect(reg(XMLDecl).test(invalid)).toBe(false);
		})
	);
});
