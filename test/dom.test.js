const { DOMParser } = require('..');

describe('NodeList', () => {
	it('is iterable', () => {
		let markup = '<parent></parent>';
		let document = new DOMParser().parseFromString(markup);
		let nodeList = document.firstChild.childNodes;
		expect(nodeList[Symbol.iterator]).toBeDefined();
	})

	it('is deconstructable', () => {
		let markup = '<parent><child>a</child><child>b</child><child>c</child></parent>';
		let document = new DOMParser().parseFromString(markup);
		let children = new Array(...document.firstChild.childNodes);
		expect(children.length).toEqual(3);

		let contents = children.map(el => el.childNodes[0].nodeValue);
		expect(contents).toStrictEqual(['a', 'b', 'c']);
	})
})
