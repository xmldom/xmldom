'use strict';
// This is a config file to be able to run as many tests as possible using
// https://wallabyjs.com/
// usually it wrks without any config, but on of our tests doesn't, so it is excluded

module.exports = {
	tests: {
		override: (testPatterns) => {
			// this test relies on stacktrace of errors which are not available in instrumented files
			// they are not "visible" for wallaby, would be nicer to mark them as skipped
			testPatterns.push('!test/error/reported-levels.test.js');
			return testPatterns;
		},
	},
};
