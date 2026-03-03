---
sidebar_position: 9
title: "Exercise 8: RDF-only blocks and OWL ontologies"
slug: /ogc-blocks-core-capabilities/exercise-8
---

# Exercise 8: RDF-only blocks and OWL ontologies

All the blocks in Exercises 1–7 are *schema blocks*: they have a `schema.yaml`
and describe data that is primarily JSON. But OGC Blocks also supports a second
kind: *model blocks*, which capture a semantic data model expressed in OWL and
SHACL without any JSON Schema at all.

A model block is appropriate when:

- The same conceptual model is (or will be) implemented by multiple encoding
  schemas, and you want a single authoritative place to define the semantics
  and rules.
- You are defining a reusable ontology that other blocks or systems should
  import.
- You want the postprocessor's CI/CT pipeline — automated validation with
  pass/fail test cases — applied to an OWL-based model rather than a JSON
  schema.

The ontology lives in `ontology.ttl`. The SHACL rules in `rules.shacl` target
RDF classes defined in that ontology. Examples are Turtle files (`.ttl`) rather
than JSON, and `tests/` works exactly as before: any Turtle file there with a
`-fail` suffix must fail the SHACL rules.

## Step 1: Create the exercise files

Create the directory `_sources/exercise8/` with the following structure:

```
_sources/exercise8/
├── bblock.json
├── rules.shacl
├── examples.yaml
├── examples/
│   └── example.ttl
└── tests/
    └── example-fail.ttl
```

**`bblock.json`** — note `itemClass: "model"` and the `ontology` reference,
which tells the viewer where to find the OWL file once it exists:

```json
{
  "name": "Exercise 8: RDF-only blocks and OWL ontologies",
  "abstract": "A model-type block defining a data model in OWL and SHACL, validated against Turtle examples.",
  "itemClass": "model",
  "ontology": "ontology.ttl",
  "status": "under-development",
  "dateTimeAddition": "2024-01-01T00:00:00Z",
  "version": "0.1",
  "dateOfLastChange": "2024-01-01"
}
```

**`rules.shacl`** — a SHACL rule targeting the `Researcher` class:

```turtle
@prefix sh:  <http://www.w3.org/ns/shacl#> .
@prefix :    <https://w3id.org/example#> .

<#testValues>
    a              sh:NodeShape ;
    sh:targetClass :Researcher ;
    sh:message     "Researchers must belong to at least one named Organization" ;
    sh:property    [ sh:path     :partOf ;
                     sh:class    :Organization ;
                     sh:minCount 1 ]
.
```

**`examples.yaml`**:

```yaml
examples:
- title: Valid researcher instance
  snippets:
    - language: ttl
      ref: examples/example.ttl
```

**`examples/example.ttl`** — Fred belongs to GnomesInc (valid):

```turtle
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix :     <https://w3id.org/example#> .
@prefix eg:   <https://w3id.org/example-data#> .

eg:Fred
    a          :Researcher ;
    :partOf    eg:GnomesInc ;
    rdfs:label "Fred the Gardener" .

eg:GnomesInc
    a          :Organization ;
    rdfs:label "Gnomes Inc. Gardeners to the Stars" .
```

**`tests/example-fail.ttl`** — Fred has no `:partOf` relationship (must fail):

```turtle
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix :     <https://w3id.org/example#> .
@prefix eg:   <https://w3id.org/example-data#> .

eg:Fred
    a          :Researcher ;
    rdfs:label "Fred the Gardener" .

eg:GnomesInc
    rdfs:label "Gnomes Inc. Gardeners to the Stars" .
```

Run the postprocessor. Navigate to the **Exercise 8** block. The **Ontology**
tab is missing — `ontology.ttl` does not exist yet. The SHACL rules do run
against the Turtle examples: the valid example passes and the negative test
correctly fails.

## Step 2: Add the ontology and rebuild

Create `_sources/exercise8/ontology.ttl`:

```turtle
@prefix :    <https://w3id.org/example#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@base <https://w3id.org/example> .

<https://w3id.org/example>
    rdf:type       owl:Ontology ;
    rdfs:comment   "An example ontology for OGC Blocks tutorial." .

###  Object Properties

:hasMember
    rdf:type       owl:ObjectProperty ;
    rdfs:domain    :Organization ;
    rdfs:range     :Researcher ;
    rdfs:label     "has member" .

:partOf
    rdf:type       owl:ObjectProperty ;
    rdfs:domain    :Researcher ;
    rdfs:range     :Organization ;
    rdfs:label     "part of" .

###  Classes

:Organization
    rdf:type       owl:Class ;
    rdfs:label     "Organization" ;
    rdfs:comment   "An organized body of people with a particular purpose." .

:Researcher
    rdf:type       owl:Class ;
    rdfs:label     "Researcher" ;
    rdfs:comment   "A person who conducts scientific research." .

:Association
    rdf:type       owl:Class ;
    rdfs:subClassOf :Organization ;
    rdfs:label     "Association" ;
    rdfs:comment   "A type of Organization that is formally constituted." .
```

Rerun the postprocessor. Navigate to the **Exercise 8** block:

- **Ontology** tab: shows the OWL class and property definitions loaded from
  `ontology.ttl`. The viewer renders the ontology structure — classes,
  properties, and their domain/range relationships.
- **Examples** tab: unchanged — the Turtle example still passes and the
  negative test still fails.

## How it works

### `itemClass: "model"`

The `itemClass` field in `bblock.json` tells the postprocessor what kind of
block this is. Setting it to `"model"` switches the block into RDF-only mode:
no JSON Schema is expected, examples are Turtle files, and the `ontology.ttl`
file is treated as the primary artifact.

Contrast this with `"schema"` (used in Exercises 1–7), where `schema.yaml` is
the primary artifact and JSON files are the examples.

### How SHACL rules work with Turtle examples

The postprocessor applies `rules.shacl` to each Turtle example exactly as it
does for JSON examples after semantic uplift. The workflow is:

1. Load the example Turtle file into an RDF graph.
2. Apply the SHACL shapes from `rules.shacl`.
3. Record pass/fail and any violation messages.

No JSON-LD context is needed — the example is already RDF.

### OWL + SHACL

OWL and SHACL are complementary:

- **OWL** describes the conceptual model — what classes exist, what properties
  they have, what the domain and range of each property is.
- **SHACL** describes the constraints — what data conforming to that model must
  look like in practice.

A Researcher is defined by the OWL ontology as a type of entity. Whether a
particular Researcher instance is valid (has at least one `:partOf` link to an
Organization) is a SHACL constraint. OWL reasoning and SHACL validation are
deliberately kept separate: OWL is for inference, SHACL is for validation.

### Multiple schemas, one model

A key use case for model blocks is reuse across encodings. You might have:

- A JSON Schema block that encodes the Organization/Researcher model as JSON
- An XML Schema block that encodes the same model as XML
- A GeoJSON Feature block that packages it spatially

All three can reference the same model block, inheriting its SHACL rules
automatically. Changes to the semantic model propagate to all implementing
schemas without any manual coordination.

---

Next: [Exercise 9 — Profiling an ontology](./section-9.md).
