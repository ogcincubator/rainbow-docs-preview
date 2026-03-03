---
sidebar_position: 4
title: "Exercise 3: Semantic validation with SHACL"
slug: /ogc-blocks-core-capabilities/exercise-3
---

# Exercise 3: Semantic validation with SHACL

JSON Schema validates *structure*: types, required fields, string formats,
value ranges. But there are constraints that JSON Schema cannot express, such
as "the value of field X must be less than the value of field Y," or "this
resource must be linked to at least one instance of class Z."

These are semantic constraints — they depend on the *meaning* of the fields,
not just their position in a document. Because the JSON-LD context established
in Exercise 2 maps each field to a URI, the data can be represented as an RDF
graph. And over an RDF graph, [SHACL](https://www.w3.org/TR/shacl/)
(Shapes Constraint Language) can express exactly these kinds of constraints.

A block's SHACL rules live in `rules.shacl`. The postprocessor applies them to
the uplifted RDF graph of every example and records whether each shape passes
or fails.

## Step 1: Create the exercise files

Create the directory `_sources/exercise3/` and add the following files.

**`bblock.json`**:

```json
{
  "name": "Exercise 3: Semantic validation with SHACL",
  "abstract": "Adding a SHACL rule that enforces a cross-property constraint on the RDF graph.",
  "itemClass": "schema",
  "status": "under-development",
  "dateTimeAddition": "2024-01-01T00:00:00Z",
  "version": "0.1",
  "dateOfLastChange": "2024-01-01"
}
```

**`schema.yaml`** (same schema as before):

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

**`context.jsonld`** — note the namespace is different from Exercise 2
(`http://example.org/ns1/` rather than `http://example.com/mythings/`):

```json
{
  "@context": {
    "mynamespace": "http://example.org/ns1/",
    "a": "@type",
    "b": "https://example.org/my-bb-model/b",
    "c": "https://example.org/my-bb-model/c"
  }
}
```

**`examples.yaml`**:

```yaml
examples:
- title: A minimal object
  snippets:
    - language: json
      code: |
        {
          "a": "mynamespace:aThing",
          "b": 23,
          "c": 1
        }
```

**`rules.shacl`** — a constraint that `c` must be less than `b`, but with
**no target class declared**:

```turtle
@prefix sh:          <http://www.w3.org/ns/shacl#> .
@prefix mynamespace: <http://example.org/ns1/> .
@prefix ns1:         <https://example.org/my-bb-model/> .

<#testValues>
    a              sh:NodeShape ;
    sh:message     "C must be less than B" ;
    sh:property    [ sh:path     ns1:c ;
                     sh:lessThan ns1:b ]
.
```

The shape defines a constraint — `c` must be less than `b` — but it has no
target. Without `sh:targetClass`, SHACL has no way to know which nodes in the
RDF graph to apply the shape to, so the constraint is never checked.

Run the postprocessor. Navigate to the **Exercise 3** block and open the
**Examples** tab. The example passes — but it passes because the rule is never
applied, not because the data is valid. Open the validation report (linked from
the banner on the block's main page) and look at the SHACL section: the
`#testValues` shape is listed but shows no targeted nodes — confirming that the
constraint ran against nothing.

## Step 2: Add the target class and rebuild

Add `sh:targetClass mynamespace:aThing ;` to the shape in `rules.shacl`:

```turtle
<#testValues>
    a              sh:NodeShape ;
    sh:targetClass mynamespace:aThing ;
    sh:message     "C must be less than B" ;
    sh:property    [ sh:path     ns1:c ;
                     sh:lessThan ns1:b ]
.
```

Rerun the postprocessor and navigate to the **Exercise 3** block in the viewer.
Open the **Examples** tab. The example has `"b": 23` and `"c": 1`, so
`c < b` — the constraint passes, and the example validates. Open the validation
report and look at the SHACL section: the blank node representing the example
is now listed as a target of the `#testValues` shape, with the `sh:lessThan`
constraint shown as passing. This is the confirmation that the rule is
genuinely active and checking real data.

To verify the rule is working, temporarily modify your inline snippet in
`examples.yaml` to set `"c": 30` (greater than `b=23`) and rebuild. The
validation result will flip to a failure with the shape message. Restore the
original value when you are done.

## How it works

### How SHACL targets nodes

`sh:targetClass mynamespace:aThing` tells SHACL to apply this shape to every
node in the RDF graph that has the RDF type `mynamespace:aThing`. In the SHACL
file, `mynamespace` is declared as `<http://example.org/ns1/>`, so the target
class is `http://example.org/ns1/aThing`.

In the example JSON, `"a": "mynamespace:aThing"` is interpreted using the
`context.jsonld`, where `"a": "@type"` and `"mynamespace":
"http://example.org/ns1/"` — so the value expands to the same URI,
`http://example.org/ns1/aThing`. The blank node representing the example object
is therefore assigned that type, and the shape targets it.

Without the `sh:targetClass`, the shape exists but is never applied. SHACL
requires an explicit target — it does not apply shapes to all nodes by default.

### The `sh:lessThan` constraint

```turtle
sh:property [ sh:path ns1:c ; sh:lessThan ns1:b ]
```

This property constraint says: for every node matched by the shape, the value
at path `ns1:c` must be less than the value at path `ns1:b`. Because
`context.jsonld` maps `c` to `ns1:c` and `b` to `ns1:b`, the uplifted RDF
carries the numeric values at those predicates, and SHACL can compare them.

### JSON Schema vs SHACL

| | JSON Schema | SHACL |
|---|---|---|
| Operates on | Raw JSON | Uplifted RDF graph |
| Can express | Types, required fields, formats, ranges | Cross-property relationships, class membership, cardinality over graph links |
| Requires | Nothing | JSON-LD context (to produce the RDF graph) |
| Triggered by | Any JSON snippet | JSON snippets after semantic uplift |

The two validation layers are complementary. Use JSON Schema for structural
correctness, SHACL for semantic correctness.

---

Next: [Exercise 4 — Profiling a block and writing unit tests](./section-4.md).
