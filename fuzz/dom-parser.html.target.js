'use strict';

const { DOMParser, ParseError, MIME_TYPE, XMLSerializer } = require('../lib');

module.exports.fuzz = (buffer) => {
	try {
		const parsed = new DOMParser({
			errorHandler: (level, message) => {
				if (level === 'error' && message.startsWith('element parse error: ')) {
					throw new Error(message);
				}
			},
		}).parseFromString(buffer.toString(), MIME_TYPE.HTML);
		new XMLSerializer().serializeToString(parsed);
	} catch (error) {
		if (error instanceof ParseError) return -1;
		throw error;
	}
};
