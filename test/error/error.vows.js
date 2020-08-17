var wows = require('vows');
var DOMParser = require('../../lib/dom-parser').DOMParser;
const assert = require('../assert');

var xml =
	'<scxml xmlns="http://www.w3.org/2005/07/scxml" version="1.0"\n\
       profile="ecmascript" id="scxmlRoot" initial="start">\n\
\n\
  <!--\n\
      some comment (next line is empty)\n\
\n\
  -->\n\
\n\
  <state id="start" name="start">\n\
    <transition event"init" name="init" target="main_state" />\n\
  </state>\n\
\n\
  </scxml>';
var error = [];
var parser = new DOMParser({
	locator: {},
	errorHandler: {
		error: function (msg) {
			error.push(msg);
		},
	},
});
var doc = parser.parseFromString(xml, 'text/html');
var doc = parser.parseFromString(
	'<html><body title="1<2"><table>&lt;;test</body></body></html',
	'text/html'
);

wows
	.describe('errorHandle')
	.addBatch({
		'only single function with two args builds map': function () {
			var error = {};
			var parser = new DOMParser({
				errorHandler: function (key, msg) {
					error[key] = msg;
				},
			});
			var doc = parser.parseFromString(
				'<html disabled><1 1="2"/></body></html>',
				'text/xml'
			);
			assert.isTrue(
				typeof error.warning === 'string',
				'error.warning: ' + String(error.warning)
			);
			assert.isTrue(
				typeof error.error === 'string',
				'error.error: ' + String(error.error)
			);
		},
		'only one function with one argument builds list': function () {
			var error = [];
			var parser = new DOMParser({
				errorHandler: function (msg) {
					error.push(msg);
				},
			});
			var doc = parser.parseFromString(
				'<html disabled><1 1="2"/></body></html>',
				'text/xml'
			);
			error.map(function (e) {
				error[/^\[xmldom (\w+)\]/.exec(e)[1]] = e;
			});
			assert.isTrue(
				typeof error.warning === 'string',
				'error.warning:' + error.warning
			);
			assert.isTrue(
				typeof error.error === 'string',
				'error.error:' + error.error
			);
		},
		'compare one function with only one key': function () {
			var error = [];
			var errorMap = [];
			const faulty = '<html><body title="1<2">test</body></html>';
			new DOMParser({
				errorHandler: function (msg) {
					error.push(msg);
				},
			}).parseFromString(faulty, 'text/xml');
			['warn', 'warning', 'error', 'fatalError'].forEach(function (k) {
				var errorHandler = { [k]: [] };
				errorHandler[k] = function (msg) {
					errorMap[k].push(msg);
				};
				new DOMParser({ errorHandler: errorHandler }).parseFromString(
					faulty,
					'text/xml'
				);
				assert.isTrue(errorHandler[k].length > 0, 'expected entries for ' + k);
			});
			var error2 = [];
			for (var n in errorMap) {
				error2 = error2.concat(errorMap[n]);
				assert(error.length, errorMap[n].length);
			}

			assert(
				error2.sort().join(','),
				error.sort().join(','),
				'expected same messages'
			);
		},
		'error function throwing is not caught': function () {
			var error = [];
			var parser = new DOMParser({
				locator: {},
				errorHandler: {
					error: function (msg) {
						error.push(msg);
						throw new Error('from throwing errroHandler.error');
					},
				},
			});
			var doc1 = parser.parseFromString(
				'<html><body title="1<2"><table>&lt;;test</body></body></html>',
				'text/html'
			);
			try {
				var doc2 = parser.parseFromString(
					'<html><body title="1<2"><table&lt;;test</body></body></html>',
					'text/html'
				);
			} catch (e) {
				if (e.message !== 'from throwing errroHandler.error') throw e;
			}
			assert.isTrue(
				error.length > 0 &&
					error.every((e) => /\n@#\[line\:\d+,col\:\d+\]/.test(e)),
				'line,col must record:' + JSON.stringify(error)
			);
			assert(
				doc1,
				'<html xmlns="http://www.w3.org/1999/xhtml"><body title="1&lt;2"><table></table>&lt;;test</body></html>'
			);
			assert(doc2, undefined);
		},
	})
	.export(module);
