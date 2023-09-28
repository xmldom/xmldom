import {
	DOMParser,
	MIME_TYPE,
	onWarningStopParsing,
	XMLSerializer,
} from '@xmldom/xmldom';

const source = `<xml xmlns="a">
	<child>test</child>
	<child/>
</xml>`;
const doc = new DOMParser({
	onError: onWarningStopParsing,
}).parseFromString(source, MIME_TYPE.XML_TEXT);

const serialized = new XMLSerializer().serializeToString(doc);

if (source !== serialized) {
	throw `expected\n${source}\nbut was\n${serialized}`;
} else {
	console.log(serialized);
}
