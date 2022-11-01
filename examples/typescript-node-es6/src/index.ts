import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

const source = `<xml xmlns="a">
	<child>test</child>
	<child/>
</xml>`;
const errors: [string, string][] = [];
const doc = new DOMParser({
	onError: (level: string, message: string) => {
		errors.push([level, message]);
	},
}).parseFromString(source, 'text/xml');

const serialized = new XMLSerializer().serializeToString(doc);

if (source !== serialized) {
	throw `expected\n${source}\nbut was\n${serialized}`;
}
if (errors.length > 0) {
	throw errors;
}
