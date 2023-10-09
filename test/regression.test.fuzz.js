'use strict';

const { describe, test } = require('@jest/globals');
const xml = require('./dom-parser.xml.fuzz');
const html = require('./dom-parser.html.fuzz');

describe('ensure previous fuzzer findings are not reintroduced', () => {
	test.fuzz('dom-parser.xml.fuzz.js', xml.fuzz);
	test.fuzz('dom-parser.html.fuzz.js', html.fuzz);
	test.fuzz('console.log', (data) => console.log(data.toString()));
});
