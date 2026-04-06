'use strict';

const { DOMParser, XMLSerializer } = require('../../lib');

describe('XML Structure Injection via Comment and Processing Instruction', () => {
	describe('Comment Node Injection Prevention', () => {
		it('should escape --> delimiter in comment data', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const comment = doc.createComment('legitimate comment--><injected>malicious</injected><!--');
			doc.documentElement.appendChild(comment);

			const serialized = new XMLSerializer().serializeToString(doc);
			
			// The -- should be escaped to -&#x2D; (hyphen entity) to prevent --> formation
			expect(serialized).toContain('-&#x2D;>');
			expect(serialized).not.toMatch(/-->.*<injected>/);

			// Verify that reparsing doesn't create injected elements
			const reparsed = new DOMParser().parseFromString(serialized, 'text/xml');
			const injected = reparsed.getElementsByTagName('injected');
			expect(injected.length).toBe(0);
		});

		it('should handle multiple --> sequences in comment', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const comment = doc.createComment('test-->middle-->end');
			doc.documentElement.appendChild(comment);

			const serialized = new XMLSerializer().serializeToString(doc);
			
			// All -- should be escaped with hyphen entity
			expect(serialized).toContain('test-&#x2D;>middle-&#x2D;>end');
			expect(serialized).not.toContain('test--');
		});

		it('should not affect legitimate comments without injection attempts', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const comment = doc.createComment('This is a normal comment');
			doc.documentElement.appendChild(comment);

			const serialized = new XMLSerializer().serializeToString(doc);
			
			expect(serialized).toContain('<!--This is a normal comment-->');
			
			// Verify reparsing works correctly
			const reparsed = new DOMParser().parseFromString(serialized, 'text/xml');
			expect(reparsed.documentElement.childNodes.length).toBe(1);
			expect(reparsed.documentElement.firstChild.nodeType).toBe(8); // COMMENT_NODE
		});

		it('should prevent comment injection with complex payload', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const maliciousPayload = 'comment--><script>alert("XSS")</script><!--';
			const comment = doc.createComment(maliciousPayload);
			doc.documentElement.appendChild(comment);

			const serialized = new XMLSerializer().serializeToString(doc);
			
			// Verify the script tag is not executable
			expect(serialized).toContain('-&#x2D;>');
			
			const reparsed = new DOMParser().parseFromString(serialized, 'text/xml');
			const scripts = reparsed.getElementsByTagName('script');
			expect(scripts.length).toBe(0);
		});
	});

	describe('Processing Instruction Node Injection Prevention', () => {
		it('should escape ?> delimiter in PI data', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const pi = doc.createProcessingInstruction('target', 'data?><injected>malicious</injected><?');
			doc.documentElement.appendChild(pi);

			const serialized = new XMLSerializer().serializeToString(doc);
			
			// The ?> should be escaped to ?&#x3E; (greater-than entity)
			expect(serialized).toContain('?&#x3E;');
			expect(serialized).not.toMatch(/\?>.*<injected>/);

			// Verify that reparsing doesn't create injected elements
			const reparsed = new DOMParser().parseFromString(serialized, 'text/xml');
			const injected = reparsed.getElementsByTagName('injected');
			expect(injected.length).toBe(0);
		});

		it('should handle multiple ?> sequences in PI data', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const pi = doc.createProcessingInstruction('target', 'test?>middle?>end');
			doc.documentElement.appendChild(pi);

			const serialized = new XMLSerializer().serializeToString(doc);
			
			// All ?> should be escaped with greater-than entity
			expect(serialized).toContain('test?&#x3E;middle?&#x3E;end');
			expect(serialized).not.toContain('test?>middle');
		});

		it('should not affect legitimate PIs without injection attempts', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const pi = doc.createProcessingInstruction('xml-stylesheet', 'type="text/xsl" href="style.xsl"');
			doc.documentElement.appendChild(pi);

			const serialized = new XMLSerializer().serializeToString(doc);
			
			expect(serialized).toContain('<?xml-stylesheet type="text/xsl" href="style.xsl"?>');
			
			// Verify reparsing works correctly
			const reparsed = new DOMParser().parseFromString(serialized, 'text/xml');
			expect(reparsed.documentElement.childNodes.length).toBe(1);
			expect(reparsed.documentElement.firstChild.nodeType).toBe(7); // PROCESSING_INSTRUCTION_NODE
		});

		it('should prevent PI injection with complex payload', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const maliciousPayload = 'data?><element attr="value">content</element><?';
			const pi = doc.createProcessingInstruction('target', maliciousPayload);
			doc.documentElement.appendChild(pi);

			const serialized = new XMLSerializer().serializeToString(doc);
			
			// Verify the element is not created
			expect(serialized).toContain('?&#x3E;');
			
			const reparsed = new DOMParser().parseFromString(serialized, 'text/xml');
			const elements = reparsed.getElementsByTagName('element');
			expect(elements.length).toBe(0);
		});
	});

	describe('Combined Comment and PI Injection Prevention', () => {
		it('should handle document with both comment and PI injection attempts', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			
			const comment = doc.createComment('comment--><injected1/><!--');
			const pi = doc.createProcessingInstruction('target', 'data?><injected2/><?');
			
			doc.documentElement.appendChild(comment);
			doc.documentElement.appendChild(pi);

			const serialized = new XMLSerializer().serializeToString(doc);
			
			// Both should be escaped with entities
			expect(serialized).toContain('-&#x2D;>');
			expect(serialized).toContain('?&#x3E;');
			
			// Verify no injected elements
			const reparsed = new DOMParser().parseFromString(serialized, 'text/xml');
			expect(reparsed.getElementsByTagName('injected1').length).toBe(0);
			expect(reparsed.getElementsByTagName('injected2').length).toBe(0);
		});

		it('should maintain document structure integrity after escaping', () => {
			const doc = new DOMParser().parseFromString('<root><child/></root>', 'text/xml');
			
			const comment = doc.createComment('test-->injection');
			const pi = doc.createProcessingInstruction('target', 'test?>injection');
			
			doc.documentElement.insertBefore(comment, doc.documentElement.firstChild);
			doc.documentElement.appendChild(pi);

			const serialized = new XMLSerializer().serializeToString(doc);
			const reparsed = new DOMParser().parseFromString(serialized, 'text/xml');
			
			// Verify structure is maintained
			expect(reparsed.documentElement.nodeName).toBe('root');
			expect(reparsed.getElementsByTagName('child').length).toBe(1);
			expect(reparsed.documentElement.childNodes.length).toBe(3); // comment, child, pi
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty comment data', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const comment = doc.createComment('');
			doc.documentElement.appendChild(comment);

			const serialized = new XMLSerializer().serializeToString(doc);
			expect(serialized).toContain('<!---->');
		});

		it('should handle empty PI data', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const pi = doc.createProcessingInstruction('target', '');
			doc.documentElement.appendChild(pi);

			const serialized = new XMLSerializer().serializeToString(doc);
			expect(serialized).toContain('<?target ?>');
		});

		it('should handle comment with multiple dashes', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const comment = doc.createComment('test-----value');
			doc.documentElement.appendChild(comment);

			const serialized = new XMLSerializer().serializeToString(doc);
			const reparsed = new DOMParser().parseFromString(serialized, 'text/xml');
			expect(reparsed.documentElement.childNodes.length).toBe(1);
			expect(reparsed.documentElement.firstChild.nodeType).toBe(8); // COMMENT_NODE
		});

		it('should handle PI with only question marks', () => {
			const doc = new DOMParser().parseFromString('<root/>', 'text/xml');
			const pi = doc.createProcessingInstruction('target', '???');
			doc.documentElement.appendChild(pi);

			const serialized = new XMLSerializer().serializeToString(doc);
			const reparsed = new DOMParser().parseFromString(serialized, 'text/xml');
			expect(reparsed.documentElement.childNodes.length).toBe(1);
		});
	});
});

// Made with Bob
