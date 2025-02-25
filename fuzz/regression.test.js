'use strict';
// wallaby:file.skip since wallaby is not concerned with fuzz testing
const { describe, expect, test, beforeAll } = require('@jest/globals');

const fs = require('fs');
const path = require('path');
const TARGETS = fs
	.readdirSync(__dirname)
	.filter((file) => file.endsWith('.target.js'))
	.map((target) => [target, path.join(__dirname, target)]);

TARGETS.forEach(([target, targetPath]) => {
	describe(target, () => {
		const regressionDir = path.join(__filename.replace(/\.js$/, ''), target);
		const testfiles = fs.readdirSync(regressionDir);
		const module = require(targetPath);
		beforeAll(() => {
			expect(fs.existsSync(regressionDir)).toBe(true);
			expect(testfiles.length).toBeGreaterThan(0);
		});
		testfiles.forEach((testfile) => {
			test(path.basename(testfile), () => {
				expect(module.fuzz(fs.readFileSync(path.join(regressionDir, testfile)))).toMatchSnapshot();
			});
		});
	});
});
