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
	describe('', () => {
		beforeAll(() => {
			const regressionDir = path.join(__filename.replace(/\.js$/, ''), target);
			expect(fs.existsSync(regressionDir)).toBe(true);
			const testfiles = fs.readdirSync(regressionDir);
			expect(testfiles.length).toBeGreaterThan(0);
		});
		const module = require(targetPath);
		test.fuzz(target, (data) => module.fuzz(data));
	});
});
