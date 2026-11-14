# Deno example

Deno can import the published npm package directly, including its TypeScript definitions.
This example pins the package version so that its output is reproducible.

From the repository root, enter the example directory and run its task:

```sh
cd examples/deno
deno task test
```

The task type-checks and runs `main.ts`. The first run downloads the npm package into Deno's cache. No permission flags are needed.
The example parses an XML document, verifies its content, and serializes it back to the original string:

```xml
<message>Hello from Deno!</message>
```

This example uses the published package rather than the local repository source.
