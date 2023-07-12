'use strict';

const { DOMParser, XMLSerializer } = require('../../lib');
const { MIME_TYPE } = require('../../lib/conventions');
const { Node } = require('../../lib/dom');

describe('ProcessingInstruction', () => {
    test('can properly create a ProcessingInstruction', () => {
        const doc = new DOMParser().parseFromString('<xml></xml>', MIME_TYPE.XML_TEXT);
        const pi = doc.createProcessingInstruction('xml-stylesheet', 'href="mycss.css" type="text/css"');

        expect(pi.target).toBe('xml-stylesheet');
        expect(pi.data).toBe('href="mycss.css" type="text/css"');
        expect(pi.nodeType).toBe(Node.PROCESSING_INSTRUCTION_NODE);
        expect(pi.nodeName).toBe('xml-stylesheet');
    });

    test('can properly append a ProcessingInstruction to a document', () => {
        const doc = new DOMParser().parseFromString('<xml></xml>', MIME_TYPE.XML_TEXT);
        const pi = doc.createProcessingInstruction('xml-stylesheet', 'href="mycss.css" type="text/css"');

        doc.appendChild(pi);
        const str = new XMLSerializer().serializeToString(doc).trim();

        expect(str).toBe('<xml/><?xml-stylesheet href="mycss.css" type="text/css"?>');
    });

    test('can properly clone a ProcessingInstruction', () => {
        const doc = new DOMParser().parseFromString('<xml></xml>', MIME_TYPE.XML_TEXT);
        const pi = doc.createProcessingInstruction('xml-stylesheet', 'href="mycss.css" type="text/css"');

        doc.appendChild(pi);
        const piClone = pi.cloneNode();

        expect(piClone.target).toBe(pi.target);
        expect(piClone.data).toBe(pi.data);
        expect(piClone.nodeType).toBe(pi.nodeType);
        expect(piClone.nodeName).toBe(pi.nodeName);
    });

    test('can properly set data of a ProcessingInstruction', () => {
        const doc = new DOMParser().parseFromString('<xml></xml>', MIME_TYPE.XML_TEXT);
        const pi = doc.createProcessingInstruction('xml-stylesheet', 'href="mycss.css" type="text/css"');

        pi.data = 'href="newcss.css" type="text/css"';
        expect(pi.data).toBe('href="newcss.css" type="text/css"');
    });
});
