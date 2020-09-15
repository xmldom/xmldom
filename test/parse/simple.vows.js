var wows = require('vows');
var DOMParser = require('../../lib/dom-parser').DOMParser;
var assert = require('../assert');

wows
	.describe('parse')
	.addBatch({
		simple: function () {
			var parser = new DOMParser();
			var doc = parser.parseFromString(
				'<html><body title="1<2"></body></html>',
				'text/html'
			);
			assert(
				doc + '',
				'<html xmlns="http://www.w3.org/1999/xhtml"><body title="1&lt;2"></body></html>'
			);
		},
		unclosedFix: function () {
			var parser = new DOMParser();
			var dom = parser.parseFromString(
				'<r><Page><Label /></Page  <Page></Page></r>',
				'text/xml'
			);
			assert(dom + '', '<r><Page><Label/></Page>  <Page/></r>');
		},
		test: function () {
			var parser = new DOMParser();
			var dom = parser.parseFromString(
				'<Page><Label class="title"/></Page  1',
				'text/xml'
			);
			assert.equal(dom + '', '<Page><Label class="title"/></Page>  1');
		},
		'svg test': function () {
			var svgCase = [
				'<svg>',
				'  <metadata>...</metadata>',
				'  <defs id="defs14">',
				'  <path id="path4" d="M 68.589358,...-6.363961,-6.363964 z" />',
				'  <path id="path4" d="M 68.589358,...-6.363961,-6.363964 z" /></defs>',
				'</svg>',
			].join('\n');
			var parser = new DOMParser({ locator: {} });
			var dom = parser.parseFromString(svgCase, 'text/xml');
			assert(dom + '', svgCase.replace(/ \/>/g, '/>'));
		},
		'line error': function () {
			var xmlLineError = [
				'<package xmlns="http://ns.saxonica.com/xslt/export"',
				'         xmlns:fn="http://www.w3.org/2005/xpath-functions"',
				'         xmlns:xs="http://www.w3.org/2001/XMLSchema"',
				'         xmlns:vv="http://saxon.sf.net/generated-variable"',
				'         version="20"',
				'         packageVersion="1">',
				'  <co id="0" binds="1">',
				'</package>',
			].join('\r\n');

			var parser = new DOMParser({ locator: {} });
			var dom = parser.parseFromString(xmlLineError, 'text/xml');
			var node = dom.documentElement.firstChild.nextSibling;
			assert(node.lineNumber, 7);
		},
		'invalid input - falsy string': runParserWith(''),
		'invalid input - not a string': runParserWith({}),
		'invalid input - number': runParserWith(12345),
		'invalid input - null': runParserWith(null),
	})
	.export(module);

function runParserWith(testValue) {
	return function () {
		var parser = new DOMParser(rethrowErrorHandler());

		try {
			parser.parseFromString(testValue);
			// If the above line doesn't throw then fail the test
			assert.isTrue(false);
		} catch (e) {
			assert.isTrue(isInvalidDocSource(e));
		}
	};
}

function rethrowErrorHandler() {
	return {
		errorHandler: {
			error: function (errorMessage) {
				throw errorMessage;
			},
		},
	};
}

function isInvalidDocSource(errorMessage) {
	// Errors that are thrown are embedded within a string containing locator data. Infer the original
	// error message via regex
	return /^\[xmldom error\][\s]*invalid doc source[\s\S]*$/.test(errorMessage);
}
