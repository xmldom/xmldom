# Breaking changes

This document describes what xmldom considers a breaking change and what it does not. It applies to
every change: bug fixes, security fixes and features.

[Semantic Versioning](https://semver.org/spec/v2.0.0.html) ties breaking changes to ["backward
incompatible changes [...] to the public API"](https://semver.org/spec/v2.0.0.html#spec-item-8).
It requires every project to declare that public API, and says the declaration ["SHOULD be precise and
comprehensive"](https://semver.org/spec/v2.0.0.html#spec-item-1). It does not say what counts
as backward incompatible. This document is that declaration for xmldom.

## Versions

xmldom has not made a major release so far (see [RELEASE.md](RELEASE.md)). As long as the major
version is 0, [Semantic Versioning](https://semver.org/spec/v2.0.0.html#spec-item-4) allows anything
to change at any time. xmldom draws the line at the minor version instead, which npm's `^0.M.p`
ranges don't cross automatically:

- only a minor release (`0.M.0`) may contain breaking changes
- a patch release (`0.M.p`) must not contain breaking changes

A breaking change that shipped in a patch release by mistake is reverted in the next patch release.

A change is judged against the latest release of the minor version it ships in. In a minor
release, the same rules decide which changes the changelog marks as breaking.

## Public API

The public API is what the package's entry point (`lib/index.js`) exports, with the types declared in
`index.d.ts` and the behavior that the [readme](../readme.md) and the comments in `index.d.ts`
describe.

Not part of the public API, so changing it is never breaking:

- modules under `lib/` other than the entry point, even though they can be imported
- error messages and the `cause` of an error
- the tests in `test/errors/`: they record which errors are reported, so those errors stay
  reproducible
- serialized output that does not parse, even when a test covers it. Such output is a bug. Please
  report it as an issue. If it could let someone inject or alter markup, follow
  [SECURITY.md](../SECURITY.md) instead.

The following sections say which changes to the public API are breaking.

## Supported runtimes

This section covers the runtimes listed in `engines` in `package.json`.

**Breaking:**

- raising the minimum supported version of a runtime
- a supported runtime no longer being able to require or import the entry point (`lib/index.js`)

## Exports, methods and options

This section covers the exports of `lib/index.js` and their types in `index.d.ts`. Code written
against the previous release has to keep working, both at runtime and when type-checked against
`index.d.ts`.

**Breaking:**

- removing or renaming an export, a class, a method, a property, a parameter or an option
- making an optional parameter or option required
- changing a parameter, option or return type so that code written for the previous types no longer
  type-checks or no longer works
- changing a default value or the documented behavior of an existing call
- throwing for arguments that were accepted before

**Not breaking:**

- adding an export, a class, a method or a property
- adding an optional parameter or option
- accepting more argument types or values than before
- changing a type in `index.d.ts` to match runtime behavior that has not changed since `0.M.0`, even
  if code that type-checked before no longer does: that code relied on behavior no `0.M.p` release
  had
- any other change that keeps the types and the behavior compatible

## `DOMParser`: accepted inputs

This section covers which inputs `DOMParser` accepts.

**Breaking:** rejecting an input that parses today.

No exceptions are expected. A case is decided individually only
when something else strongly speaks against accepting the input, such as the
accepted input producing an invalid DOM. Even then the bar is very high:
Cases like `0.8.4`
(discussion [#458](https://github.com/xmldom/xmldom/discussions/458),
[`GHSA-crh6-fp67-6883`](https://github.com/xmldom/xmldom/security/advisories/GHSA-crh6-fp67-6883))
should either not be repeated or only with a strong argument.

## `XMLSerializer`: serialized output

This section covers the string `XMLSerializer` returns. A change is judged by re-parsing today's
output with xmldom's `DOMParser`, using the same options as before. The rules hold even when the new
output follows the specification or current browsers.

**Breaking:**

- changing output that parses into a different tree than the one that was serialized. Such a change
  can be treated as not breaking only with an explicit argument, stated in the changelog, that
  weighs:
  - the severity
  - the assumed impact on dependents
  - how soon the next minor release is due: the sooner it is, the more the change should wait for it
- changing the prefix of an element or attribute: `prefix`, `nodeName` and lookups by qualified name
  (e.g. `getElementsByTagName('p:x')`) see it.

**Not breaking:**

- changing output that does not parse today (see [Public API](#public-api)):
  - re-parsing the new output may succeed, or throw a different error than before
  - output that parses today and changes as well is judged by the other rules in this section
- adding or dropping a namespace declaration, when after re-parsing the following stay identical:
  - the namespace, prefix and local name of every element and of every attribute that is not a
    namespace declaration
  - the namespace `lookupNamespaceURI` returns for every prefix on every element

In the DOM, a namespace declaration is an attribute in the namespace `http://www.w3.org/2000/xmlns/`,
so `attributes` and `getAttributeNS` with that namespace do see an added or dropped declaration. Code
that reads declarations directly cannot rely on them across serializers, browsers included. The
changelog repeats this argument for each such change.

## Errors

This section covers the errors an operation throws.

**Breaking:** throwing a different error type (e.g. something other than `ParseError`) where the
operation throws today.

**Not breaking:** changing the message or the `cause` of an error (see [Public API](#public-api)).

## Opt-in options

This section covers options that turn on a fix (see [SECURITY.md](../SECURITY.md)).

**Not breaking:**

- shipping a fix that would be breaking in a patch release behind an opt-in option
- making that option reject more input or output later, within the documented purpose of the option
