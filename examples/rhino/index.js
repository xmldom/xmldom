'use strict';
const { DOMParser, XMLSerializer } = require('../../lib/index');

const source = `<xml xmlns="a">
	<child>test</child>
	<child/>
</xml>`;

const doc = new DOMParser().parseFromString(source, 'text/xml');

const serialized = new XMLSerializer().serializeToString(doc);
if (source !== serialized) {
	print(`expected\n${source}\nbut was\n${serialized}`);
	process.exit(1);
} else {
	print(serialized);
}
