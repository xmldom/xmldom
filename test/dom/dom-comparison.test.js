'use strict';
const { DOMParser } = require('../../lib');
const { DOMException } = require('../../lib/dom');

// Tests following for steps in the specification
// https://dom.spec.whatwg.org/#dom-node-comparedocumentposition
describe('DOM position comparison', () => {
        const dp = new DOMParser();
        const x0 = dp.parseFromString(
                '<x0 foo="a" bar="b">' +
                        '<x1 foo="a" bar="b">' +
                        '<x2 foo="a" bar="b">c</x2>' +
                        '<y2 foo="a" bar="b">d</y2>' +
                        '</x1>' +
                        '<y1 foo="a" bar="b">' +
                        '<z2 foo="a" bar="b">e</z2>' +
                        '</y1></x0>', 'text/xml').documentElement;
        const x1 = x0.childNodes[0];
        const y1 = x0.childNodes[1];
        const x2 = x1.childNodes[0];
        const y2 = x1.childNodes[1];
        const z2 = y1.childNodes[0];
        const foo = x0.attributes[0];
        const bar = x0.attributes[1];
        let text = x2.childNodes[0];
        it('Step 1', () => {
                expect(x0.compareDocumentPosition(x0)).toBe(0);
                expect(x1.compareDocumentPosition(x1)).toBe(0);
                expect(foo.compareDocumentPosition(foo)).toBe(0);
                expect(text.compareDocumentPosition(text));
        });
	it('Step 5 2 1 1', async () => {
                expect(bar.compareDocumentPosition(foo)).toBe(34);
        });
	it('Step 5 2 1 2', async () => {
                expect(foo.compareDocumentPosition(bar)).toBe(36);
        });
	it('Step 6', () => {
	        const root = dp.parseFromString('<xml><baz abaz="y"></baz></xml>', 'text/xml').documentElement;
                const baz = root.childNodes[0];
                const abaz = baz.attributes[0];
                // This ensures the comparison is stable.
                let comp = x0.compareDocumentPosition(root) === 35;
                expect(x0.compareDocumentPosition(root)).toBe(comp ? 35 : 37);
                expect(root.compareDocumentPosition(x0)).toBe(comp ? 37 : 35);
                expect(x1.compareDocumentPosition(baz)).toBe(comp ? 35 : 37);
                expect(baz.compareDocumentPosition(x1)).toBe(comp ? 37 : 35);
                expect(foo.compareDocumentPosition(abaz)).toBe(comp ? 35 : 37);
                expect(abaz.compareDocumentPosition(foo)).toBe(comp ? 37 : 35);
        });
        it('Step 7', () => {
                expect(x1.compareDocumentPosition(x0)).toBe(10);
                expect(x2.compareDocumentPosition(x0)).toBe(10);
                expect(x2.compareDocumentPosition(x1)).toBe(10);
                expect(foo.compareDocumentPosition(x0)).toBe(10);
        });
        it('Step 8', () => {
                expect(x0.compareDocumentPosition(x1)).toBe(20);
                expect(x0.compareDocumentPosition(x2)).toBe(20);
                expect(x1.compareDocumentPosition(x2)).toBe(20);
                expect(x0.compareDocumentPosition(foo)).toBe(20);
        });
        it('Step 9', () => {
                expect(y1.compareDocumentPosition(x1)).toBe(2);
                expect(y1.compareDocumentPosition(x2)).toBe(2);
                expect(z2.compareDocumentPosition(x2)).toBe(2);
                expect(z2.compareDocumentPosition(x1)).toBe(2);
                expect(y1.compareDocumentPosition(x1.attributes[0])).toBe(2);
                expect(x1.attributes[0].compareDocumentPosition(foo)).toBe(2);
                expect(y1.attributes[0].compareDocumentPosition(foo)).toBe(2);
        });
        it('Step 10', () => {
                expect(x1.compareDocumentPosition(y1)).toBe(4);
                expect(x2.compareDocumentPosition(y1)).toBe(4);
                expect(x2.compareDocumentPosition(z2)).toBe(4);
                expect(x1.compareDocumentPosition(z2)).toBe(4);
                expect(x1.attributes[0].compareDocumentPosition(y1)).toBe(4);
                expect(foo.compareDocumentPosition(x1.attributes[0])).toBe(4);
                expect(foo.compareDocumentPosition(y1.attributes[0])).toBe(4);
        });
});
