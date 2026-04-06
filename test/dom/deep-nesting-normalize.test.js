'use strict';

const { DOMParser } = require('../../lib');

describe('Deep Nesting Stack Overflow DoS Prevention', () => {
	describe('normalize() with deeply nested elements', () => {
		it('should handle deeply nested elements without stack overflow', () => {
			const depth = 10000;
			let xml = '<root>';
			for (let i = 0; i < depth; i++) {
				xml += '<level' + i + '>';
			}
			xml += 'content';
			for (let i = depth - 1; i >= 0; i--) {
				xml += '</level' + i + '>';
			}
			xml += '</root>';

			const doc = new DOMParser().parseFromString(xml, 'text/xml');
			
			// This should not throw a stack overflow error
			expect(() => {
				doc.normalize();
			}).not.toThrow();
		});

		it('should handle deeply nested elements with text nodes', () => {
			const depth = 5000;
			let xml = '<root>';
			for (let i = 0; i < depth; i++) {
				xml += '<level' + i + '>text' + i;
			}
			for (let i = depth - 1; i >= 0; i--) {
				xml += '</level' + i + '>';
			}
			xml += '</root>';

			const doc = new DOMParser().parseFromString(xml, 'text/xml');
			
			expect(() => {
				doc.normalize();
			}).not.toThrow();
		});

		it('should correctly merge adjacent text nodes in deeply nested structure', () => {
			const depth = 1000;
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			
			// Build a deeply nested structure programmatically
			let current = doc.documentElement;
			for (let i = 0; i < depth; i++) {
				const elem = doc.createElement('level' + i);
				current.appendChild(elem);
				current = elem;
			}
			
			// Add multiple text nodes at the deepest level
			current.appendChild(doc.createTextNode('text1'));
			current.appendChild(doc.createTextNode('text2'));
			current.appendChild(doc.createTextNode('text3'));
			
			// Normalize should merge the text nodes without stack overflow
			expect(() => {
				doc.normalize();
			}).not.toThrow();
			
			// Verify text nodes were merged
			expect(current.childNodes.length).toBe(1);
			expect(current.firstChild.nodeValue).toBe('text1text2text3');
		});

		it('should handle wide trees with many siblings', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const root = doc.documentElement;
			
			// Create 1000 sibling elements
			for (let i = 0; i < 1000; i++) {
				const elem = doc.createElement('child' + i);
				elem.appendChild(doc.createTextNode('text1'));
				elem.appendChild(doc.createTextNode('text2'));
				root.appendChild(elem);
			}
			
			expect(() => {
				doc.normalize();
			}).not.toThrow();
			
			// Verify text nodes in each child were merged
			for (let i = 0; i < root.childNodes.length; i++) {
				const child = root.childNodes[i];
				expect(child.childNodes.length).toBe(1);
				expect(child.firstChild.nodeValue).toBe('text1text2');
			}
		});

		it('should handle mixed deep and wide structure', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const root = doc.documentElement;
			
			// Create a structure that is both deep and wide
			for (let i = 0; i < 100; i++) {
				let current = doc.createElement('branch' + i);
				root.appendChild(current);
				
				// Make each branch deep
				for (let j = 0; j < 100; j++) {
					const elem = doc.createElement('level' + j);
					elem.appendChild(doc.createTextNode('a'));
					elem.appendChild(doc.createTextNode('b'));
					current.appendChild(elem);
					current = elem;
				}
			}
			
			expect(() => {
				doc.normalize();
			}).not.toThrow();
		});
	});

	describe('normalize() correctness with various structures', () => {
		it('should merge adjacent text nodes at root level', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const root = doc.documentElement;
			
			root.appendChild(doc.createTextNode('text1'));
			root.appendChild(doc.createTextNode('text2'));
			root.appendChild(doc.createTextNode('text3'));
			
			doc.normalize();
			
			expect(root.childNodes.length).toBe(1);
			expect(root.firstChild.nodeValue).toBe('text1text2text3');
		});

		it('should not merge text nodes separated by elements', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const root = doc.documentElement;
			
			root.appendChild(doc.createTextNode('text1'));
			root.appendChild(doc.createElement('separator'));
			root.appendChild(doc.createTextNode('text2'));
			
			doc.normalize();
			
			expect(root.childNodes.length).toBe(3);
			expect(root.childNodes[0].nodeValue).toBe('text1');
			expect(root.childNodes[1].nodeName).toBe('separator');
			expect(root.childNodes[2].nodeValue).toBe('text2');
		});

		it('should handle empty text nodes', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const root = doc.documentElement;
			
			root.appendChild(doc.createTextNode(''));
			root.appendChild(doc.createTextNode('text'));
			root.appendChild(doc.createTextNode(''));
			
			doc.normalize();
			
			expect(root.childNodes.length).toBe(1);
			expect(root.firstChild.nodeValue).toBe('text');
		});

		it('should normalize nested structures correctly', () => {
			const doc = new DOMParser().parseFromString('<root><child/></root>', 'text/xml');
			const child = doc.documentElement.firstChild;
			
			child.appendChild(doc.createTextNode('a'));
			child.appendChild(doc.createTextNode('b'));
			child.appendChild(doc.createTextNode('c'));
			
			doc.normalize();
			
			expect(child.childNodes.length).toBe(1);
			expect(child.firstChild.nodeValue).toBe('abc');
		});

		it('should handle document with no text nodes', () => {
			const doc = new DOMParser().parseFromString('<root><a/><b/><c/></root>', 'text/xml');
			
			expect(() => {
				doc.normalize();
			}).not.toThrow();
			
			expect(doc.documentElement.childNodes.length).toBe(3);
		});
	});

	describe('Performance and stress tests', () => {
		it('should complete normalization in reasonable time for large documents', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const root = doc.documentElement;
			
			// Create a large flat structure
			for (let i = 0; i < 5000; i++) {
				root.appendChild(doc.createTextNode('text' + i));
			}
			
			const startTime = Date.now();
			doc.normalize();
			const endTime = Date.now();
			
			// Should complete in less than 5 seconds
			expect(endTime - startTime).toBeLessThan(5000);
			
			// All text nodes should be merged
			expect(root.childNodes.length).toBe(1);
		});

		it('should handle pathological case of alternating text and element nodes', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const root = doc.documentElement;
			
			for (let i = 0; i < 1000; i++) {
				root.appendChild(doc.createTextNode('text' + i));
				root.appendChild(doc.createElement('sep' + i));
			}
			root.appendChild(doc.createTextNode('final'));
			
			expect(() => {
				doc.normalize();
			}).not.toThrow();
			
			// Should have 1000 elements and 1001 text nodes (no merging possible)
			expect(root.childNodes.length).toBe(2001);
		});
	});
});

// Made with Bob
