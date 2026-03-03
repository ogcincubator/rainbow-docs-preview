---
sidebar_position: 7
title: "Exercise 6: Importing from an external register"
slug: /ogc-blocks-core-capabilities/exercise-6
---

# Exercise 6: Importing from an external register

So far all the blocks you have referenced — `ogc.geo.features.feature`,
`ogc.bblocks.tutorial.exercise3` — live either in the standard OGC register or
in the same repository. OGC Blocks also supports referencing blocks from *any*
published register, including third-party ones maintained by other organizations.

This is how standards ecosystems are supposed to work: rather than copying a
specification into your own repository and maintaining a fork, you declare a
dependency on the canonical published version. If the upstream block is updated,
you re-run your build and any incompatibilities surface immediately.

To reference blocks from an external register, that register's URL must be
listed under `imports` in `bblocks-config.yaml`. The postprocessor fetches the
register's `register.json` at build time and makes all its blocks available for
`$ref` resolution.

The `topo-feature` import is already configured in your `bblocks-config.yaml`
from the initial setup, so you do not need to modify it for this exercise.

## Step 1: Create the exercise files

Create the directory `_sources/exercise6/` with the following structure:

```
_sources/exercise6/
├── bblock.json
├── schema.yaml
├── examples.yaml
├── examples/
│   └── example.json
└── tests/
    └── example-fail.json
```

**`bblock.json`**:

```json
{
  "name": "Exercise 6: Importing from an external register",
  "abstract": "Profiling a block from the external topo-feature register.",
  "itemClass": "schema",
  "status": "under-development",
  "dateTimeAddition": "2024-01-01T00:00:00Z",
  "version": "0.1",
  "dateOfLastChange": "2024-01-01"
}
```

**`schema.yaml`** — only the local constraint is present; the topo-line
reference is absent:

```yaml
description: Line with only two points
properties:
  topology:
    properties:
      references:
        minItems: 2
        maxItems: 2
```

The constraint (`references` must have exactly 2 items) is already active but
applies to any object with a `topology.references` field — it does not inherit
the full topo-line schema or any of its semantic annotations.

**`examples.yaml`**:

```yaml
examples:
- title: Line with 2 points
  snippets:
    - language: json
      ref: examples/example.json
```

**`examples/example.json`** — a valid topo-line Feature:

```json
{
  "type": "Feature",
  "id": "LineP1P2",
  "geometry": null,
  "topology": {
    "type": "LineString",
    "references": ["P1", "P2"]
  },
  "properties": null
}
```

**`tests/example-fail.json`** — a Feature with three references (violates the
2-item maximum):

```json
{
  "type": "Feature",
  "id": "LineP1P2P3",
  "geometry": null,
  "topology": {
    "type": "LineString",
    "references": ["P1", "P2", "P3"]
  },
  "properties": null
}
```

Run the postprocessor. The example is accepted (the 2-item constraint is
active), but navigate to the **JSON Schema** tab — the schema is minimal and
does not include the full topo-line Feature structure. The **Dependencies**
tab shows no external dependencies.

## Step 2: Add the `$ref` and rebuild

Replace the flat `properties` constraint with an `allOf` that first references
the topo-line block, then adds the local refinement:

```yaml
allOf:
  - $ref: bblocks://ogc.geo.topo.features.topo-line
  - properties:
      topology:
        properties:
          references:
            minItems: 2
            maxItems: 2
```

Rerun the postprocessor. The build process will fetch the topo-feature register
and resolve `bblocks://ogc.geo.topo.features.topo-line` from it.

Navigate to the **Exercise 6** block:

- **JSON Schema** tab: the fully resolved schema now includes the complete
  topo-line structure (a GeoJSON Feature with a `topology` object), with your
  additional constraint that `references` must have exactly 2 items.
- **Dependencies** tab: the graph shows this block depending on
  `ogc.geo.topo.features.topo-line` from the external register.
- **Examples** tab: the valid example passes; the `example-fail.json` negative
  test correctly fails (three references where only two are allowed).

## How it works

### The `imports` field in `bblocks-config.yaml`

```yaml
imports:
  - https://ogcincubator.github.io/topo-feature
```

This tells the postprocessor to fetch the `register.json` from the topo-feature
GitHub Pages URL at build time. All blocks described in that register become
available for `bblocks://` references, exactly as if they were in the same
repository.

### Why this matters: FAIR reuse

Declaring an explicit dependency rather than copying a schema:

- Makes the dependency machine-readable and navigable (the **Dependencies** tab
  shows it).
- Ensures you are always building against the canonical published version.
- Means that if the upstream block gains additional semantic annotations or
  SHACL rules, your block inherits them automatically on the next build.
- Avoids the divergence and maintenance burden of maintaining a local copy.

The topo-feature register is a real, actively maintained OGC incubator project.
By profiling it rather than copying it, this exercise block participates in
the broader linked ecosystem of OGC specifications.

### Profiling vs copying

| Approach | Pros | Cons |
|---|---|---|
| Profile (`$ref` + import) | Always aligned with upstream; dependency is explicit and navigable | Requires upstream to be published and stable |
| Copy | No runtime dependency on upstream URL | Must manually track and apply upstream changes; divergence is invisible |

For published standards, profiling is almost always the right choice.

---

Next: [Exercise 7 — Transforms](./section-7.md).
