"use strict";

module.exports = {
	"env": {
		"node": true,
		"es6": true,
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 6,
	},
	"rules": {
		"indent": [ "error", "tab" ],
		"strict": ["error", "global"],
		"no-redeclare": [ "warn" ],
		"no-unused-vars": [ "warn", { "args": "none" } ],
		"no-cond-assign": 0,
		// "no-unreachable": [ "error" ],
		"linebreak-style": [  "error", "unix" ],
		// "semi": [ "error", "always" ],
		// "comma-dangle": [ "error", "always-multiline" ],
		// "no-console": [ "error" ],
	}
};
