## 0.3.0

[Commits](https://github.com/xmldom/xmldom/compare/0.2.1...0.3.0)

- **BREAKING** Node >=10.x is now required.
- **BREAKING** Removed component.json (deprecated package manager https://github.com/componentjs/guide)
- **BREAKING** Moved existing sources into `lib` subdirectory.
- Update devDependency `proof`
- Removed `.npmignore` in favor of `files` entry in `package.json`.

- [Added `Document.getElementsByClassName`](https://github.com/xmldom/xmldom/issues/24).
- [Added `Node` to the list of exports](https://github.com/xmldom/xmldom/pull/27)
- [Added lowercase of åäö in `entityMap`](https://github.com/xmldom/xmldom/pull/23).
- More `package.json` cleanup/refactoring.
- Moved CHANGELOG to markdown file.
- Moved LICENSE to markdown file.
- Fixed travis CI.
- README updates.

## 0.2.1

[Commits](https://github.com/xmldom/xmldom/compare/0.2.0...0.2.1)

- Correct `homepage`, `repository` and `bugs` URLs in `package.json`.

## 0.2.0

[Commits](https://github.com/xmldom/xmldom/compare/v0.1.27...0.2.0)

**Includes all BREAKING changes introduced in [`xmldom-alpha@v0.1.28`](#0128-only-via-xmldom-alpha-npm-package) and in later commits to master by the original authors.**

- **BREAKING?** [removes the `Object.create` check from the `_extends` method of `dom.js` that added a `__proto__` property](https://github.com/xmldom/xmldom/commit/0be2ae910a8a22c9ec2cac042e04de4c04317d2a#diff-7d1c5d97786fdf9af5446a241d0b6d56L19-L22) ().
- **BREAKING?** [removed code that added a `__proto__` property](https://github.com/xmldom/xmldom/commit/366159a76a181ce9a0d83f5dc48205686cfaf9cc)

- formatting/corrections in `package.json`
- Remove coveralls.
- Disable cache in travis.
- Other refactoring.

## 0.1.31

[Commits](https://github.com/xmldom/xmldom/compare/v0.1.27...v0.1.31)

The patch versions (`v0.1.29` - `v0.1.31`) that have been released on the [v0.1.x branch](https://github.com/xmldom/xmldom/tree/0.1.x), to reflect the changed maintainers, **have been branched off from [`v0.1.27`](#0127-via-xmldom-and-xmldom-alpha-npm-package) so they don't include the breaking changes introduced in [`xmldom-alpha@v0.1.28`](#0128-only-via-xmldom-alpha-npm-package)**:

## Maintainer changes

After the last commit to the original repository <https://github.com/jindw/xmldom> was done on the 9th of May 2017, the first commit to this fork was done on the 19th of December 2019. [It has been announced in the original repository on the 2nd of March 2020.](https://github.com/jindw/xmldom/issues/259)

The versions listed below have been published to one or both of the following packages:
- <https://www.npmjs.com/package/xmldom-alpha>
- <https://www.npmjs.com/package/xmldom>

The new maintainers do not plan to continue publishing the `xmldom-alpha` package.

The new maintainers did not invest time to understand changes that led to the last `xmldom` version `v0.1.27` published by the original maintainer, but consider it the basis for their work.
A time line of all the things that happened from that version until `0.3.0` is available in <https://github.com/xmldom/xmldom/issues/62> and related questions should be asked there.

## 0.1.28 (only via xmldom-alpha npm package)

[Commits](https://github.com/xmldom/xmldom/compare/v0.1.27...xmldom-alpha@v0.1.28)

published by @jindw on the 9th of May 2017 

- [`license` field in `package.json` was fixed](https://github.com/jindw/xmldom/pull/178)
- [Conditional converting of HTML entities](https://github.com/jindw/xmldom/pull/80)
  - BREAKING [introduced regression regarding `&nbsp;`](https://github.com/xmldom/xmldom/issues/57) 
- `dom.js` fixed serialization issue for missing document element ([example that failed on `toString()` before this change](https://github.com/xmldom/xmldom/blob/a58dcf7a265522e80ce520fe3be0cddb1b976f6f/test/parse/unclosedcomment.js#L10-L11))
- new module `entities.js`

## 0.1.27 (via xmldom and xmldom-alpha npm package)

published by @jindw on the 28th of Nov 2016

- Various bug fixes.
- Don't ask why 0.1.26 and 0.1.25 were skipped here, but they have been released only to xmldom npm package on the same day as 0.1.27. `¯\_(ツ)_/¯`

## 0.1.24 (via xmldom and xmldom-alpha package)

- Added node filter.

## 0.1.23 (via xmldom-alpha npm package)

- Added namespace support for nest node serialize.
- Various other bug fixes.

## 0.1.22

- Merge XMLNS serialization.
- Removed \r from source string.
- Print namespaces for child elements.
- Switch references to nodeType to use named constants.
- Add nodelist toString support.

## 0.1.21

- Fixed serialize bug.

## 0.1.20

- Optimized invalid XML support.
- Added toString sorter for attributes output.
- Added html self closed node button.
- Added `*` NS support for getElementsByTagNameNS.
- Converted attribute's value to string in setAttributeNS.
- Added support for HTML entities for HTML docs only.
- Fixed TypeError when Document is created with DocumentType.

## 0.1.19

- Fixed issue #68, infinite loop on unclosed comment.
- Added error report for unclosed tag.
- Various other fixes.

## 0.1.18

- Added default `ns` support.
- parseFromString now renders entirely plain text documents as textNode.
- Enabled option to ignore white space on parsing.

## 0.1.16

- Correctly handle multibyte Unicode greater than two byts. #57. #56.
- Initial unit testing and test coverage. #53. #46. #19.
- Create Bower `component.json` #52.

## 0.1.8

- Add: some test case from node-o3-xml(excludes xpath support)
- Fix: remove existed attribute before setting  (bug introduced in v0.1.5)
- Fix: index direct access for childNodes and any NodeList collection(not w3c standard)
- Fix: remove last child bug
