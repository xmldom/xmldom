import { DOMParser, XMLSerializer } from 'npm:@xmldom/xmldom@0.9.12';

const source = '<message>Hello from Deno!</message>';
const doc = new DOMParser().parseFromString(source, 'application/xml');
const serialized = new XMLSerializer().serializeToString(doc);

if (
	doc.documentElement?.textContent !== 'Hello from Deno!' ||
	serialized !== source
) {
	throw new Error('The XML document did not round-trip as expected.');
}

console.log(serialized);
