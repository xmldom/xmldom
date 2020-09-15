var wows = require('vows')
var assert = require('../assert')
var DOMParser = require('../../lib/dom-parser').DOMParser
var XMLSerializer = require('../../lib/dom-parser').XMLSerializer
var parser = new DOMParser()

wows
	.describe('html normalizer')
	.addBatch({
		'text & <': function () {
			var dom = new DOMParser().parseFromString(
				'<div>&amp;&lt;123&456<789;&&</div>',
				'text/html'
			)
			assert(
				dom + '',
				'<div xmlns="http://www.w3.org/1999/xhtml">&amp;&lt;123&amp;456&lt;789;&amp;&amp;</div>'
			)

			var dom = new DOMParser().parseFromString(
				'<div><123e>&<a<br/></div>',
				'text/html'
			)
			assert(
				dom + '',
				'<div xmlns="http://www.w3.org/1999/xhtml">&lt;123e>&amp;&lt;a<br/></div>'
			)

			var dom = new DOMParser().parseFromString(
				'<div>&nbsp;&copy;&nbsp&copy</div>',
				'text/html'
			)
			assert(
				dom + '',
				'<div xmlns="http://www.w3.org/1999/xhtml">\u00a0\u00a9&amp;nbsp&amp;copy</div>'
			)

			var dom = new DOMParser().parseFromString(
				'<html xmlns:x="1"><body/></html>',
				'text/html'
			)
			assert(
				dom + '',
				'<html xmlns:x="1" xmlns="http://www.w3.org/1999/xhtml"><body></body></html>'
			)
		},
		attr: function () {
			var dom = new DOMParser().parseFromString(
				'<html test="a<b && a>b && \'&amp;&&\'"/>',
				'text/html'
			)
			assert(
				dom + '',
				'<html test="a&lt;b &amp;&amp; a>b &amp;&amp; \'&amp;&amp;&amp;\'" xmlns="http://www.w3.org/1999/xhtml"></html>'
			)

			var dom = new DOMParser().parseFromString(
				'<div test="alert(\'<br/>\')"/>',
				'text/html'
			)
			assert(
				dom + '',
				'<div test="alert(\'&lt;br/>\')" xmlns="http://www.w3.org/1999/xhtml"></div>'
			)
			var dom = new DOMParser().parseFromString(
				'<div test="a<b&&a< c && a>d"></div>',
				'text/html'
			)
			assert(
				dom + '',
				'<div test="a&lt;b&amp;&amp;a&lt; c &amp;&amp; a>d" xmlns="http://www.w3.org/1999/xhtml"></div>'
			)

			var dom = new DOMParser().parseFromString(
				'<div a=& bb c d=123&&456/>',
				'text/html'
			)
			assert(
				dom + '',
				'<div a="&amp;" bb="bb" c="c" d="123&amp;&amp;456" xmlns="http://www.w3.org/1999/xhtml"></div>'
			)

			var dom = new DOMParser().parseFromString(
				'<div a=& a="&\'\'" b/>',
				'text/html'
			)
			assert(
				dom + '',
				'<div a="&amp;\'\'" b="b" xmlns="http://www.w3.org/1999/xhtml"></div>'
			)
		},
		attrQute: function () {
			var dom = new DOMParser().parseFromString(
				'<html test="123"/>',
				'text/html'
			)
			assert(
				dom + '',
				'<html test="123" xmlns="http://www.w3.org/1999/xhtml"></html>'
			)

			var dom = new DOMParser().parseFromString(
				'<r><Label onClick="doClick..>Hello, World</Label></r>',
				'text/html'
			)
			assert.skip(
				dom + '',
				'<r xmlns="http://www.w3.org/1999/xhtml"><Label onClick="doClick..">Hello, World</Label></r>'
			)

			var dom = new DOMParser().parseFromString(
				'<Label onClick=doClick..">Hello, World</Label>',
				'text/html'
			)
			assert(
				dom + '',
				'<Label onClick="doClick.." xmlns="http://www.w3.org/1999/xhtml">Hello, World</Label>'
			)
		},
		unclosed: function () {
			var dom = new DOMParser().parseFromString(
				'<html><meta><link><img><br><hr><input></html>',
				'text/html'
			)
			assert(
				dom + '',
				'<html xmlns="http://www.w3.org/1999/xhtml"><meta/><link/><img/><br/><hr/><input/></html>'
			)

			var dom = new DOMParser().parseFromString(
				'<html title =1/2></html>',
				'text/html'
			)
			assert(
				dom + '',
				'<html title="1/2" xmlns="http://www.w3.org/1999/xhtml"></html>'
			)

			var dom = new DOMParser().parseFromString('<html title= 1/>', 'text/html')
			assert(
				dom + '',
				'<html title="1" xmlns="http://www.w3.org/1999/xhtml"></html>'
			)

			var dom = new DOMParser().parseFromString(
				'<html title = 1/>',
				'text/html'
			)
			assert(
				dom + '',
				'<html title="1" xmlns="http://www.w3.org/1999/xhtml"></html>'
			)

			var dom = new DOMParser().parseFromString('<html title/>', 'text/html')
			assert(
				dom + '',
				'<html title="title" xmlns="http://www.w3.org/1999/xhtml"></html>'
			)

			var dom = new DOMParser().parseFromString(
				'<html><meta><link><img><br><hr><input></html>',
				'text/html'
			)
			assert(
				dom + '',
				'<html xmlns="http://www.w3.org/1999/xhtml"><meta/><link/><img/><br/><hr/><input/></html>'
			)
		},
		script: function () {
			var dom = new DOMParser().parseFromString(
				'<script>alert(a<b&&c?"<br>":">>");</script>',
				'text/html'
			)
			assert(
				dom + '',
				'<script xmlns="http://www.w3.org/1999/xhtml">alert(a<b&&c?"<br>":">>");</script>'
			)
			var dom = new DOMParser().parseFromString(
				'<script>alert(a<b&&c?"<br>":">>");</script>',
				'text/xml'
			)
			assert(
				dom + '',
				'<script>alert(a&lt;b&amp;&amp;c?"<br/>":">>");</script>'
			)
			var dom = new DOMParser().parseFromString(
				'<script>alert(a<b&&c?"<br/>":">>");</script>',
				'text/html'
			)
			assert(
				dom + '',
				'<script xmlns="http://www.w3.org/1999/xhtml">alert(a<b&&c?"<br/>":">>");</script>'
			)

			var dom = new DOMParser().parseFromString(
				'<script src="./test.js"/>',
				'text/html'
			)
			assert(
				dom + '',
				'<script src="./test.js" xmlns="http://www.w3.org/1999/xhtml"></script>'
			)
		},
		textarea: function () {
			var dom = new DOMParser().parseFromString(
				'<textarea>alert(a<b&&c?"<br>":">>");</textarea>',
				'text/html'
			)
			assert(
				dom + '',
				'<textarea xmlns="http://www.w3.org/1999/xhtml">alert(a&lt;b&amp;&amp;c?"&lt;br>":">>");</textarea>'
			)

			var dom = new DOMParser().parseFromString(
				'<textarea>alert(a<b&&c?"<br>":">>");</textarea>',
				'text/xml'
			)
			assert(
				dom + '',
				'<textarea>alert(a&lt;b&amp;&amp;c?"<br/>":">>");</textarea>'
			)
		},
		'European entities': function () {
			var dom = new DOMParser().parseFromString(
				'<div>&Auml;&auml;&Aring;&aring;&AElig;&aelig;&Ouml;&ouml;&Oslash;&oslash;&szlig;&Uuml;&uuml;&euro;</div>',
				'text/html'
			)
			// For the future, it may be nicer to use \uxxxx in the assert strings
			// rather than pasting in multi-byte UTF-8 Unicode characters
			assert(
				dom + '',
				'<div xmlns="http://www.w3.org/1999/xhtml">ÄäÅåÆæÖöØøßÜü€</div>'
			)
		},
	})
	.export(module)
