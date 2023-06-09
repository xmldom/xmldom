'use strict';
// This is a config file to be able to run as many tests as possible using
// https://wallabyjs.com/
// usually it works without any config, but test/error/reported-levels.test.js
// relies on stacktrace of errors which are not available in instrumented files,
// so it is marked as skipped

module.exports = {
	hints: {
		// https://wallabyjs.com/docs/intro/selected-tests.html#test-file-selection
		testFileSelection: {
			include: /wallaby:file\.only/,
			exclude: /wallaby:file\.skip/,
		},
	},
};
