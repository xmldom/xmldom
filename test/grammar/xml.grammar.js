'use strict';

const { DOMParser, MIME_TYPE } = require('../../lib');
const fs = require('fs');

const onError = () => {};
const collected = {};
/**
 * @returns {Document}
 */
const parseSpecFile = (filename) => {
	var doc = new DOMParser({ onError }).parseFromString(fs.readFileSync(__dirname + `/${filename}`, 'utf-8'), MIME_TYPE.HTML);
	const scraps = doc.getElementsByClassName('scrap');
	for (let i = 0; i < scraps.length; i++) {
		const scrap = scraps.item(i);
		const trs = scrap.getElementsByTagName('tr');
		let numeric;
		let name;
		let href;
		let grammar;
		let constraints;
		for (let i = 0; i < trs.length; i++) {
			const tbody = trs.item(i);
			const tds = tbody.getElementsByTagName('td');
			// console.log(tbody.textContent);
			numeric = tds[0].textContent.trim() || numeric;
			name = tds[1].textContent.trim() || name;
			href = `#NT-${name}`;
			grammar = tds[3].textContent.trim().replace(/[\s]+/gm, ' ') || grammar;
			if (tds.length > 4) {
				const text = tds[4].textContent.trim().replace(/[\s]+/gm, ' ');
				if (text.startsWith('[')) {
					const a = tds[4].getElementsByTagName('a')[0];
					if (a) {
						const chref = a.getAttribute('href');
						constraints = { [chref]: tds[4].textContent.trim() };
					}
				} else if (text.startsWith('/*')) {
					grammar = `${grammar} ${text}`;
				}
			}
			if (!collected[name]) {
				collected[name] = {};
				collected[name][filename] = {};
			}
			if (!collected[name][filename]) {
				collected[name][filename] = {};
			}
			const it = collected[name][filename];
			if (name === 'TokenizedType') {
				console.log({ numeric, href, name, grammar, constraints, it});
			}
			it.numeric = numeric;
			it.grammar = it.grammar && !it.grammar.endsWith(grammar) ? `${it.grammar} ${grammar}` : it.grammar || grammar;
			it.href = href;
			if (constraints) {
				it.constraints = { ...it.constraints, ...constraints };
				constraints = undefined;
			}
		}
	}
	return doc;
};

parseSpecFile('xml.html');
parseSpecFile('xml11.html');
parseSpecFile('xml-names.html');
fs.writeFileSync(__dirname + '/xml.grammar.json', JSON.stringify(collected, null, '\t') + '\n');
