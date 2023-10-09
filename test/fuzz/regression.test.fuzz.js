'use strict';
// wallaby:file.skip since it complains regarding jasmine
const { expect, test, beforeAll, afterAll } = require('@jest/globals');

const fs = require('fs');
const path = require('path');
const TARGETS = fs.readdirSync(__dirname).filter((file) => file.endsWith('.target.js'));

TARGETS.forEach((target) => {
	const module = require(path.join(__dirname, target));
	const spy = jest.spyOn(module, 'fuzz');
	const testfiles = fs.readdirSync(path.join(__filename.replace(/\.js$/, ''), target));
	beforeAll(() => {
		expect(testfiles.length).toBeGreaterThan(0);
	});
	afterAll(() => {
		// avoid silently failing for targets that have no test input
		// there is one call with an empty buffer
		expect(spy).toBeCalledTimes(testfiles.length + 1);
	});
	test.fuzz(target, (data) => module.fuzz(data));
});
