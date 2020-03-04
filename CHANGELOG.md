## 0.3.0

- Node >=10.x now required.
- Added getElementsByClassName method.
- Added Node to the list of exports
- Added lowercase of åäö in entityMap.
- Moved existing sources into `lib` subdirectory.
- Removed `.npmignore` in favor of `files` entry in package.json.
- More `package.json` refactoring.
- Replaced CHANGELOG with more rigorous file.
- Replaced LICENSE with more rigorous file.
- Removed component.json (deprecated package manager https://github.com/componentjs/guide)
- `proof` devDep updated to latest.
- Fixed CI.
- README updates.

## 0.2.1

- More package.json refactoring.

## 0.2.0

- Now publishing under xmldom npm package again; retiring xmldom-alpha.
- Remove coveralls.
- Disable cache in travis.
- Other refactoring.

## 0.1.28 (via xmldom-alpha npm package)

- Removed __proto__ accessor.
- Appended HTML entities defaults.

## 0.1.27 (via xmldom-alpha npm package)

- Various bug fixes.
- Don't ask why 0.1.26 and 0.1.25 were skipped. `¯\_(ツ)_/¯`

## 0.1.24 (via xmldom-alpha package)

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
