---
sidebar_position: 2
title: "Exercise 1: Examples and validation"
slug: /ogc-blocks-core-capabilities/exercise-1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Exercise 1: Examples and validation

Examples in an OGC Block are not decoration. They are automatically validated
against the block's JSON Schema on every build, and they appear in the viewer
under the **Examples** tab alongside their validation results. A block with
examples is self-testing: if a schema change breaks a previously valid example,
the build will report it immediately.

Examples are declared in `examples.yaml` — a manifest that lists each example's
title, description, and the actual content to include (either inline or as a
reference to a file). This exercise shows that a block can exist with only
metadata and a schema, but nothing is validated until examples are wired up.

## Step 1: Create the block

Create the directory `_sources/exercise1/` with just two files.

**`bblock.json`** — block metadata:

```json
{
  "name": "Exercise 1: Examples and validation",
  "abstract": "Connecting an example file to a block and triggering automatic JSON Schema validation.",
  "itemClass": "schema",
  "status": "under-development",
  "dateTimeAddition": "2024-01-01T00:00:00Z",
  "version": "0.1",
  "dateOfLastChange": "2024-01-01"
}
```

**`schema.yaml`** — the block's JSON Schema:

```yaml
$schema: https://json-schema.org/draft/2020-12/schema
description: My example schema
type: object
properties:
  a:
    type: string
    format: uri
  b:
    type: number
  c:
    type: number
required:
  - a
  - b
```

Run the postprocessor. Navigate to the **Exercise 1** block in the viewer. The
block appears — you can see its metadata and schema in the **Overview** and
**JSON Schema** tabs. The **Examples** tab is empty: there is a valid schema,
but no data to validate against it.

## Step 2: Add the examples and rebuild

Create these two files inside `_sources/exercise1/`:

**`example.json`** — a sample data object:

```json
{
  "a": "mynamespace:aThing",
  "b": 23,
  "c": 1
}
```

Notice that `a` takes a namespace-prefixed URI value. This is intentional: in
Exercise 2 you will add a JSON-LD context that maps `a` to the special keyword
`@type`, which tells an RDF processor to treat this value as the *class* of the
enclosing object. That design choice is what makes SHACL class targeting
possible in Exercise 3.

**`examples.yaml`** — the manifest that connects the file to the block:

```yaml
examples:
- title: A minimal object
  content: |
    A simple object with properties a, b, and c.
  snippets:
    - language: json
      ref: example.json
```

Rerun the postprocessor and reload the viewer. The block's main page now shows
a **validation banner** — a status indicator at the top of the block description
that tells you at a glance whether all checks passed or whether there are
errors. For this block, the banner shows that validation passed. The banner
also links to the **validation report**: a detailed log of every example
tested, every SHACL shape applied, and any issues encountered (such as examples
listed in `examples.yaml` whose referenced files could not be found).

Open the **Examples** tab to see the result inline: the example JSON is
displayed with a green validation badge — the postprocessor validated it
against `schema.yaml` and it passed.

## How it works

### The `snippets` field

Each entry in the `snippets` list provides one piece of example content to
include. A snippet can reference a file:

```yaml
snippets:
  - language: json
    ref: example.json
```

or include content inline:

```yaml
snippets:
  - language: json
    code: |
      { "a": "mynamespace:thing", "b": 5 }
```

The `language` field determines the syntax highlighter applied in the viewer
and how the content is processed during validation. JSON and YAML snippets are
validated against the block's schema automatically; other languages are
displayed as-is.

### What the postprocessor validates

For each JSON or YAML snippet, the postprocessor:

1. Parses the content.
2. Validates it against the block's `schema.yaml` (and any schemas inherited
   via `$ref`).
3. Records the result — pass or fail — in the build output, which the viewer
   displays.

This means every committed example is a living test case. Add a snippet that
conforms, and the block always has a passing example. Introduce a breaking
schema change, and the example will flag it.

### The `content` field

The `content` field (separate from `snippets`) is free-form Markdown displayed
as the example's description. You can use it to explain the example, link to
related resources, or provide context.

---

Next: [Exercise 2 — Semantic annotation with JSON-LD](./section-2.md).
