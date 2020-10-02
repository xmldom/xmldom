## 0.3.0

[Commits](https://github.com/xmldom/xmldom/compare/0.2.1...0.3.0)

- **BREAKING** Node >=10.x is now required.
- **BREAKING** Remove `component.json` (deprecated package manager https://github.com/componentjs/guide)
- **BREAKING** Move existing sources into `lib` subdirectory.
- **POSSIBLY BREAKING** Introduce `files` entry in `package.json` and remove use of `.npmignore`.
- [Add `Document.getElementsByClassName`](https://github.com/xmldom/xmldom/issues/24).
- [Add `Node` to the list of exports](https://github.com/xmldom/xmldom/pull/27)
- [Add lowercase of åäö in `entityMap`](https://github.com/xmldom/xmldom/pull/23).
- Move CHANGELOG to markdown file.
- Move LICENSE to markdown file.

## 0.2.1

[Commits](https://github.com/xmldom/xmldom/compare/0.2.0...0.2.1)

- Correct `homepage`, `repository` and `bugs` URLs in `package.json`.

## 0.2.0

[Commits](https://github.com/xmldom/xmldom/compare/v0.1.27...0.2.0)

- Includes all **BREAKING** changes introduced in [`xmldom-alpha@v0.1.28`](#0128) by the original authors.
- **POSSIBLY BREAKING** [remove the `Object.create` check from the `_extends` method of `dom.js` that added a `__proto__` property](https://github.com/xmldom/xmldom/commit/0be2ae910a8a22c9ec2cac042e04de4c04317d2a#diff-7d1c5d97786fdf9af5446a241d0b6d56L19-L22) ().
- **POSSIBLY BREAKING** [remove code that added a `__proto__` property](https://github.com/xmldom/xmldom/commit/366159a76a181ce9a0d83f5dc48205686cfaf9cc)
- formatting/corrections in `package.json`

## 0.1.31

[Commits](https://github.com/xmldom/xmldom/compare/v0.1.27...v0.1.31)

The patch versions (`v0.1.29` - `v0.1.31`) that have been released on the [v0.1.x branch](https://github.com/xmldom/xmldom/tree/0.1.x), to reflect the changed maintainers, **are branched off from [`v0.1.27`](#0127) so they don't include the breaking changes introduced in [`xmldom-alpha@v0.1.28`](#0128)**:

## Maintainer changes

After the last commit to the original repository <https://github.com/jindw/xmldom> on the 9th of May 2017, the first commit to <https://github.com/xmldom/xmldom> is from the 19th of December 2019. [The fork has been announced in the original repository on the 2nd of March 2020.](https://github.com/jindw/xmldom/issues/259)

The versions listed below have been published to one or both of the following packages:
- <https://www.npmjs.com/package/xmldom-alpha>
- <https://www.npmjs.com/package/xmldom>

It is currently not planned to continue publishing the `xmldom-alpha` package.

The new maintainers did not invest time to understand changes that led to the last `xmldom` version [`0.1.27`](#0127) published by the original maintainer, but consider it the basis for their work.
A timeline of all the changes that happened from that version until `0.3.0` is available in <https://github.com/xmldom/xmldom/issues/62>. Any related questions should be asked there.

## 0.1.28

[Commits](https://github.com/xmldom/xmldom/compare/v0.1.27...xmldom-alpha@v0.1.28)

Published by @jindw on the 9th of May 2017 as
- `xmldom-alpha@0.1.28`

- **BREAKING** includes [regression regarding `&nbsp;` (issue #57)](https://github.com/xmldom/xmldom/issues/57) 
- [Fix `license` field in `package.json`](https://github.com/jindw/xmldom/pull/178)
- [Conditional converting of HTML entities](https://github.com/jindw/xmldom/pull/80)
- Fix `dom.js` serialization issue for missing document element ([example that failed on `toString()` before this change](https://github.com/xmldom/xmldom/blob/a58dcf7a265522e80ce520fe3be0cddb1b976f6f/test/parse/unclosedcomment.js#L10-L11))
- Add new module `entities.js`

## 0.1.27

Published by @jindw on the 28th of Nov 2016 as 
- `xmldom@0.1.27`
- `xmldom-alpha@0.1.27` 

- Various bug fixes.

## 0.1.26

Published on the 18th of Nov 2016
as `xmldom@0.1.26`

- Details unknown

## 0.1.25

Published on the 18th of Nov 2016 as 
- `xmldom@0.1.25`

- Details unknown

## 0.1.24

Published on the 27th of November 2016 as
- `xmldom@0.1.24`
- `xmldom-alpha@0.1.24`

- Added node filter.

## 0.1.23

Published on the 5th of May 2016 as
- `xmldom-alpha@0.1.23`

- Add namespace support for nest node serialize.
- Various other bug fixes.

## 0.1.22

- Merge XMLNS serialization.
- Remove \r from source string.
- Print namespaces for child elements.
- Switch references to nodeType to use named constants.
- Add nodelist toString support.

## 0.1.21

- Fix serialize bug.

## 0.1.20

- Optimize invalid XML support.
- Add toString sorter for attributes output.
- Add html self closed node button.
- Add `*` NS support for getElementsByTagNameNS.
- Convert attribute's value to string in setAttributeNS.
- Add support for HTML entities for HTML docs only.
- Fix TypeError when Document is created with DocumentType.

## 0.1.19

- Fix [infinite loop on unclosed comment (jindw/xmldom#68)](https://github.com/jindw/xmldom/issues/68)
- Add error report for unclosed tag.
- Various other fixes.

## 0.1.18

- Add default `ns` support.
- parseFromString now renders entirely plain text documents as textNode.
- Enable option to ignore white space on parsing.

## 0.1.17

**Details missing for this and potential earlier version**

## 0.1.16

- Correctly handle multibyte Unicode greater than two byts. #57. #56.
- Initial unit testing and test coverage. #53. #46. #19.
- Create Bower `component.json` #52.

## 0.1.8

- Add: some test case from node-o3-xml(excludes xpath support)
- Fix: remove existed attribute before setting  (bug introduced in v0.1.5)
- Fix: index direct access for childNodes and any NodeList collection(not w3c standard)
- Fix: remove last child bug

