/// <reference lib="dom" />

declare module '@xmldom/xmldom' {
	var DOMParser: DOMParserStatic
	var XMLSerializer: XMLSerializerStatic
	var DOMImplementation: DOMImplementationStatic

	interface DOMImplementationStatic {
		new (): DOMImplementation
	}

	interface DOMParserStatic {
		new (): DOMParser
		new (options: DOMParserOptions): DOMParser
	}

	interface XMLSerializerStatic {
		new (): XMLSerializer
	}

	interface DOMParser {
		parseFromString(source: string, mimeType?: string): Document | undefined
	}

	interface XMLSerializer {
		serializeToString(node: Node): string
	}

	interface DOMParserOptions {
		errorHandler?: ErrorHandlerFunction | ErrorHandlerObject
		locator?: boolean
		normalizeLineEndings?: (source: string) => string
		xmlns?: Record<string, string | null | undefined>
	}

	interface ErrorHandlerFunction {
		(level: 'warn' | 'error' | 'fatalError', msg: string): void
	}

	interface ErrorHandlerObject {
		warning?: (msg: string) => void
		error?: (msg: string) => void
		fatalError?: (msg: string) => void
	}
}
