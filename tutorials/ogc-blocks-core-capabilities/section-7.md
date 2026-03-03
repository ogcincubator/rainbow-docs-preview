---
sidebar_position: 8
title: "Exercise 7: Transforms"
slug: /ogc-blocks-core-capabilities/exercise-7
---

# Exercise 7: Transforms

So far every block has described data in its native form — you define a schema,
annotate it semantically, and validate it. Transforms add another layer: the
ability to declare *how to convert* data conforming to the block into a
different representation. The conversion logic travels with the block definition,
so consumers always have access to it.

Transforms are declared in `transforms.yaml`. Each transform specifies:

- An `id` and `description`
- A `type`: `jq` (JSON-to-JSON transformation), `sparql-update` (RDF graph
  manipulation), or `xslt` (XML transformation)
- Either a `ref` pointing to a file containing the transform code, or an
  inline `code` block

When the postprocessor finds `transforms.yaml`, it applies each transform to
every example in the block and records the input/output pairs. The viewer
displays these under the **Transforms** tab.

## Step 1: Create the exercise files

Create the directory `_sources/exercise7/` with the following structure:

```
_sources/exercise7/
├── bblock.json
├── schema.yaml
├── context.jsonld
├── examples.yaml
└── transforms/
    ├── prefix-keys.jq
    └── prefix-predicates.sparql
```

**`bblock.json`**:

```json
{
  "name": "Exercise 7: Transforms",
  "abstract": "Declaring jq and SPARQL Update transforms that convert examples to other representations.",
  "itemClass": "schema",
  "status": "under-development",
  "dateTimeAddition": "2024-01-01T00:00:00Z",
  "version": "0.1",
  "dateOfLastChange": "2024-01-01"
}
```

**`schema.yaml`**:

```yaml
type: object
properties:
  one:
    type: number
  two:
    type: number
  string:
    type: string
```

**`context.jsonld`** — needed for the SPARQL Update transform, which operates
on the uplifted RDF graph:

```json
{
  "@context": {
    "ex": "http://example.com/",
    "one": "ex:hasOne",
    "two": "ex:hasTwo",
    "string": "ex:hasString"
  }
}

```

**`examples.yaml`**:

```yaml
examples:
- title: Example for transforms
  snippets:
    - language: json
      code: |
        {
          "one": 1,
          "two": 2,
          "string": "value"
        }
```

**`transforms/prefix-keys.jq`** — a jq program that prepends `"PREF"` to
every key in the input object:

```jq
walk(if type == "object" then with_entries( .key |= "PREF\(.)" ) else . end)
```

**`transforms/prefix-predicates.sparql`** — a SPARQL Update query that
replaces the URI prefix of every predicate in the uplifted RDF graph:

```sparql
DELETE { ?s ?p ?o }
INSERT { ?s ?p2 ?o }
WHERE {
  ?s ?p ?o
  FILTER(STRSTARTS(STR(?p), "http://example.com/"))
  BIND(URI(REPLACE(STR(?p), "^http://example.com/", "urn:example:ex#")) as ?p2)
}
```

Run the postprocessor. Navigate to the **Exercise 7** block. There is no
**Transforms** tab — no `transforms.yaml` has been defined yet.

## Step 2: Add the transforms file and rebuild

Create `_sources/exercise7/transforms.yaml`:

```yaml
transforms:
  - id: prefix-keys
    description: Adds a "PREF" prefix to all object keys.
    type: jq
    ref: transforms/prefix-keys.jq

  - id: prefix-predicates
    description: Changes the "http://example.com/" prefix of every predicate to a URN
    type: sparql-update
    ref: transforms/prefix-predicates.sparql

  - id: inline-transform
    description: A transform's code can also be defined inside the transform's object
    type: jq
    code: |
      .test = "test"
```

Rerun the postprocessor. Navigate to the **Exercise 7** block and open the
**Transforms** tab. For each declared transform, the viewer shows the input
example and the transformed output side by side.

For the `prefix-keys` jq transform, the input:

```json
{ "one": 1, "two": 2, "string": "value" }
```

becomes:

```json
{ "PREFone": 1, "PREFtwo": 2, "PREFstring": "value" }
```

For the `prefix-predicates` SPARQL Update transform, the RDF graph is modified
in place: any triple whose predicate URI starts with `http://example.com/` is
rewritten to use a `urn:example:ex#` prefix instead.

The `inline-transform` example shows that the transformation code does not have
to live in a separate file — it can be declared directly in `transforms.yaml`
with the `code` field.

## How it works

### jq transforms

[jq](https://jqlang.github.io/jq/) is a lightweight, powerful command-line JSON
processor. A jq transform receives the example JSON as input and produces a new
JSON document as output. The `walk` function used in `prefix-keys.jq` is a
built-in that recursively traverses the input structure.

jq transforms are applied to the raw JSON input before semantic uplift. They
are suitable for restructuring, filtering, or augmenting JSON data.

### SPARQL Update transforms

A SPARQL Update transform receives the *uplifted RDF graph* of the example (not
the raw JSON) and modifies it in place using SPARQL `DELETE`/`INSERT` operations.
This is appropriate when the transformation needs to operate on the semantic
meaning of the data — for example, rewriting URIs, inferring new triples, or
removing triples that match a pattern.

SPARQL Update transforms require a `context.jsonld` to be present (so the
postprocessor can uplift the JSON to RDF first).

### Inline code vs file references

Both `ref` (pointing to a `.jq`, `.sparql`, or `.xsl` file) and inline `code`
are supported. File references are preferable for longer transforms that benefit
from syntax highlighting and independent version history. Inline `code` is
convenient for short, self-contained transforms.

---

## Advanced example: CityJSON to TopoFeature

The following is an observational exercise — there is nothing to edit. It
demonstrates what a production-grade jq transform looks like when the source
data requires significant structural manipulation.

The exercise uses CityJSON files as input — a compact format for 3D city
models where geometry is expressed as indexed references into a shared vertex
array. The transform converts these into GeoJSON features using the
[TopoFeature](https://ogcincubator.github.io/topo-feature) topology model,
which preserves the shared vertex structure rather than duplicating coordinates
across adjacent faces.

The `transforms.yaml` for this block defines a single transform:

```yaml
transforms:
  - id: topo-feature
    description: Transforms CityJSON geometries and vertices to GeoJSON / TopoFeature features.
    type: jq
    ref: transforms/topo-feature.jq
```

The `topo-feature.jq` transform (74 lines) handles:

- CityJSON type mapping to TopoFeature geometry types
- Recursive processing of nested boundary references
- CityObject semantic surface classifications (roof, wall, ground surface)
- Vertex coordinate transformation from the CityJSON array
- Extent metadata mapping

To try this exercise, you can find the complete set of files — including the
CityJSON input examples and the full `topo-feature.jq` transform — in the
[bblocks-tutorial](https://github.com/ogcincubator/bblocks-tutorial) repository
under `_sources/exercise8/`.

After running the postprocessor, open the **Transforms** tab for the block.
The viewer shows each CityJSON input alongside its TopoFeature output, making
it straightforward to verify that the transformation is correct by comparing
the two representations.

This exercise illustrates that transforms are not limited to trivial
modifications — a single jq file can express a complete, structurally complex
data conversion, and the postprocessor will apply it automatically to every
example.

---

Next: [Exercise 8 — RDF-only blocks: OWL ontologies](./section-8.md).
