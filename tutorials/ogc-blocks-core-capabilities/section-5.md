---
sidebar_position: 6
title: "Exercise 5: Packaging semantics in a GeoJSON Feature"
slug: /ogc-blocks-core-capabilities/exercise-5
---

# Exercise 5: Packaging semantics in a GeoJSON Feature

A schema for an object with three properties is useful, but most real-world
geographic data needs a *container*: a standard envelope that carries the
geometry, the identifier, and the attributes in a well-defined structure that
any GIS tool can understand. GeoJSON Feature is that envelope for most
OGC-aligned systems.

Rather than rebuilding the envelope from scratch, this exercise shows how to
declare that your block is a specialization of the standard OGC GeoJSON Feature
block. You inherit the Feature's schema (type, geometry, id, properties) and
wrap your custom attributes inside the `properties` object. The inherited
GeoJSON Feature context and your block's own context are merged automatically,
so the full set of semantic annotations is preserved.

## Step 1: Create the exercise files

Create the directory `_sources/exercise5/` with the following structure:

```
_sources/exercise5/
├── bblock.json
├── schema.yaml
├── examples.yaml
├── examples/
│   └── feature.json
└── tests/
    └── feature-fail.json
```

**`bblock.json`**:

```json
{
  "name": "Exercise 5: Packaging semantics in a GeoJSON Feature",
  "abstract": "Wrapping the Exercise 4 data model inside a standard GeoJSON Feature.",
  "itemClass": "schema",
  "status": "under-development",
  "dateTimeAddition": "2024-01-01T00:00:00Z",
  "version": "0.1",
  "dateOfLastChange": "2024-01-01"
}
```

**`schema.yaml`** — references the GeoJSON Feature block, but does not yet
constrain what goes inside `properties`:

```yaml
description: Example of a simple GeoJSON Feature specialisation
$ref: bblocks://ogc.geo.features.feature
```

This block already validates as a GeoJSON Feature — any `properties` object is
accepted. What is missing is the constraint that scopes the `properties` field
to the Exercise 4 data model.

**`examples.yaml`**:

```yaml
examples:
- title: GeoJSON Feature with custom properties
  base-uri: http://example.com/features/
  snippets:
    - language: json
      ref: examples/feature.json
```

**`examples/feature.json`** — a valid GeoJSON Feature:

```json
{
  "@context": {"mynamespace": "http://example.org/ns1/"},
  "id": "f1",
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [-111.67183507997295, 40.056709946862874],
      [-111.71,             40.156709946862874]
    ]
  },
  "properties": {
    "a": "mynamespace:aThing",
    "b": 23,
    "c": 0.1
  }
}
```

**`tests/feature-fail.json`** — a Feature with properties that violate the
Exercise 4 constraints (missing required field `a`, and `b` is absent):

```json
{
  "id": "f1",
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [-111.67183507997295, 40.056709946862874],
      [-111.71,             40.156709946862874]
    ]
  },
  "properties": {
    "notMyProp": "Mandatory property not present"
  }
}
```

Run the postprocessor. The build succeeds, but open the validation report for
the **Exercise 5** block: `tests/feature-fail.json` is a structurally valid
GeoJSON Feature (the `type`, `geometry`, and `properties` fields are all
present), so it passes validation when the postprocessor expected it to fail.
With `properties` unconstrained, the block cannot reject anything there — the
negative test is not doing its job.

## Step 2: Add the properties constraint and rebuild

Replace the schema with an `allOf` that combines the Feature reference with an
inline constraint on the `properties` field:

```yaml
description: Example of a simple GeoJSON Feature specialisation
allOf:
  - $ref: bblocks://ogc.geo.features.feature
  - properties:
      properties:
        $ref: bblocks://ogc.bblocks.tutorial.exercise4
```

:::note Properties three levels deep
The three levels of `properties` here are not a typo. The outer `properties`
is a JSON Schema keyword scoping the constraint to a particular field. The
middle `properties` is the GeoJSON Feature field that contains the feature's
attributes. The inner `$ref` is where your custom schema is plugged in.
:::

Rerun the postprocessor. Navigate to the **Exercise 5** block and explore:

- **JSON Schema** tab: the fully resolved schema now shows the complete GeoJSON
  Feature structure, with your `a`, `b`, `c` properties nested inside
  `properties.properties`.
- **Semantic Uplift** tab: the context shown is a merge of the GeoJSON Feature
  block's own context (which maps GeoJSON terms to URIs) and the context
  inherited from Exercise 4. You wrote neither of these — they were inherited.
- **Examples** tab: the feature example validates against the full combined
  schema. The negative test in `tests/` correctly fails (missing required `a`
  and `b`).

## How it works

### Composition with `allOf`

JSON Schema's `allOf` requires an instance to satisfy every schema in the list.
By combining the GeoJSON Feature reference with your custom properties
reference, you require both: the document must be a valid GeoJSON Feature
*and* its `properties` object must conform to Exercise 4's schema.

```yaml
allOf:
  - $ref: bblocks://ogc.geo.features.feature         # must be a valid Feature
  - properties:
      properties:
        $ref: bblocks://ogc.bblocks.tutorial.exercise4  # and properties must match
```

### Inherited contexts

When a block references another block via `$ref`, the postprocessor
automatically composes their JSON-LD contexts. The GeoJSON Feature block
carries a context that maps GeoJSON terms (`type`, `geometry`, `id`,
`properties`, and the GeoJSON geometry types) to their URIs in the GeoJSON
vocabulary. Your Exercise 4 context maps `a`, `b`, and `c` to their URIs.
The viewer's **Semantic Uplift** tab shows the merged result.

You do not need to redeclare any of the GeoJSON mappings in your own
`context.jsonld` — they come for free from the referenced block.

### Why standard containers matter

Packaging your domain semantics inside a standard container means that:

- Any GeoJSON client can parse and render the feature without knowing anything
  about your custom properties.
- Any linked data client can interpret the properties using the composed context.
- Any OGC API - Features implementation can serve your data unchanged.

The container provides interoperability at the structural level; the composed
context provides interoperability at the semantic level. Together they give you
both without requiring any translation layer.

---

Next: [Exercise 6 — Importing from an external register](./section-6.md).
