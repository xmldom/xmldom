const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

const source = `<xml xmlns="a">
	<child>test</child>
	<child/>
</xml>`;

const doc = new DOMParser().parseFromString(source, 'text/xml');

const serialized = new XMLSerializer().serializeToString(doc);

if (source !== serialized) {
	console.error(`expected\n${source}\nbut was\n${serialized}`);
	process.exit(1);
}
