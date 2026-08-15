# Test suite organization

Where a new test belongs, and the few conventions that aren't obvious from
looking around. Jest runs every `*.test.js` under `test/` (`npm test`).

## Where tests live

Each `lib/` module's tests live in a **folder named after it** (`test/<module>/`);
the filenames inside name the aspect under test. Always a folder, so no suite
grows into one giant file.

- **`dom-parser/`**: the `DOMParser` entry point, exercised through the public
  API. Holds `integration.test.js`, the parse tests, and `html-normalize.test.js`.
- **`dom/`**: one file per DOM class (`Attr`, `Node`, `XMLSerializer`, …).
- **`sax/`**: internal `lib/sax` functions in isolation, called directly (not
  through `DOMParser`) with stubbed handlers.
- **`conventions/`, `grammar/`**: the matching `lib/` helper or regex module.
- **`errors/`**: error and exception behavior plus the reported-error registry
  (`reported.js`). Use the plural `errors/`; an empty `test/error/` is a
  branch-switch stray, ignore it.

Two things sit outside the module folders:

- **`xmltest/`**: driven by the external `xmltest` sample corpus, not one `lib/`
  module.
- **Top-level `*.test.js`**: cross-cutting weakness guards (below) and the
  `xss.test.js` consumer scenario.

## Weakness-class guards

A suite that guards a **weakness class** lives at the top level as
`<weakness>-regression.test.js`, one file per **specific** CWE (not a broad
parent). A JSDoc header pins the CWE with its MITRE link; copy an existing file
for the shape:

- `recursion-regression.test.js`: CWE-674
- `prototype-pollution-regression.test.js`: CWE-1321
- `algorithmic-complexity-regression.test.js`: CWE-407 (and its ReDoS child
  CWE-1333)

Group `describe`s by CWE, not by advisory id. For scaling weaknesses prefer a
growth-ratio assertion over an absolute-time budget — it holds on a fast dev box
and slow CI alike (recursion overflow can't use a ratio). `xss.test.js` uses the
same header but flags CWE-79 as a downstream impact — a consumer scenario, not a
library weakness.

## Registering an error message

`test/errors/` checks every reporting line in `lib/sax.js` against a `REPORTED`
registry. When you add an `errorHandler`/thrown-`Error` message, register it in
`reported.js` (`source`/`level`/`match`); an unregistered one **fails**
`reported-levels.test.js` until you add its entry. See `reported.js` for the
entry shape.

## Helpers

Non-`.test.js` files are helpers or fixtures; each states its purpose in a header
and documents its exports with JSDoc — e.g. `get-test-parser.js`.
