/// <reference lib="dom" />

declare module "@xmldom/xmldom" {
  var DOMParser: DOMParserStatic;
  var XMLSerializer: XMLSerializerStatic;
  var DOMImplementation: DOMImplementationStatic;

  interface DOMImplementationStatic {
      new(): DOMImplementation;
  }

  interface DOMParserStatic {
      new (): DOMParser;
      new (options: Options): DOMParser;
  }

  interface XMLSerializerStatic {
      new (): XMLSerializer;
  }

  interface DOMParser {
      parseFromString(xmlsource: string, mimeType?: string): Document;
  }

  /** Options accepted by `XMLSerializer.prototype.serializeToString`. */
  interface XMLSerializerOptions {
      /**
       * When `true`, the serializer throws a DOMException with code `INVALID_STATE_ERR` if the
       * CDATASection data contains `"]]>"`.
       *
       * @default false
       */
      requireWellFormed?: boolean;
  }

  interface XMLSerializer {
      /**
       * Returns the result of serializing `node` to XML.
       *
       * When `options.requireWellFormed` is `true`, the serializer throws for content that would
       * produce ill-formed XML.
       *
       * __This implementation differs from the specification:__
       * - CDATASection nodes whose data contains `]]>` are serialized by splitting the section
       *   at each `]]>` occurrence (following W3C DOM Level 3 Core `split-cdata-sections`
       *   default behaviour) unless `requireWellFormed` is `true`.
       * - W3C DOM Parsing §3.2.1.1 requires well-formedness checks on Element `localName`s,
       *   prefixes, and attribute serialization when `requireWellFormed` is `true`. These checks
       *   are not implemented in this release.
       *
       * @throws {DOMException}
       * With code `INVALID_STATE_ERR` when `requireWellFormed` is `true` and the CDATASection
       * data contains `"]]>"`.
       * @see https://html.spec.whatwg.org/#dom-xmlserializer-serializetostring
       * @see https://github.com/w3c/DOM-Parsing/issues/84
       */
      serializeToString(node: Node, isHtml?: boolean, nodeFilter?: (node: Node) => Node | null | undefined, options?: XMLSerializerOptions): string;
  }

  interface Options {
      locator?: any;
      errorHandler?: ErrorHandlerFunction | ErrorHandlerObject | undefined;
  }

  interface ErrorHandlerFunction {
      (level: string, msg: any): any;
  }

  interface ErrorHandlerObject {
      warning?: ((msg: any) => any) | undefined;
      error?: ((msg: any) => any) | undefined;
      fatalError?: ((msg: any) => any) | undefined;
  }
}
