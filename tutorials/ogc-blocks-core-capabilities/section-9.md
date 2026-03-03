---
sidebar_position: 10
title: "Exercise 9: Profiling an ontology"
slug: /ogc-blocks-core-capabilities/exercise-9
---

# Exercise 9: Profiling an ontology

The same profiling mechanism that lets schema blocks inherit schemas and SHACL
rules from other schema blocks also works for model blocks. A model block can
declare a dependency on another model block and automatically inherit all of its
SHACL rules — then add stricter rules of its own.

This is the ontology equivalent of what Exercise 4 demonstrated for JSON Schema:
you take an existing validated model and create a more constrained specialization
without touching the original.

## Step 1: Create the exercise files

Create the directory `_sources/exercise9/` with the following structure:

```
_sources/exercise9/
├── bblock.json
├── rules.shacl
├── examples.yaml
├── examples/
│   └── example.ttl
└── tests/
    └── example-fail.ttl
```

**`bblock.json`** — uses `dependsOn` to declare the inheritance relationship:

```json
{
  "name": "Exercise 9: Profiling an ontology",
  "abstract": "Profiling Exercise 8 with a stricter SHACL constraint, inheriting the parent's rules.",
  "itemClass": "model",
  "status": "under-development",
  "dependsOn": ["ogc.bblocks.tutorial.exercise8"],
  "dateTimeAddition": "2024-01-01T00:00:00Z",
  "version": "0.1",
  "dateOfLastChange": "2024-01-01"
}
```

**`rules.shacl`** — a stricter rule: Researchers must belong to at least one
*Association* (a subtype of Organization):

```turtle
@prefix sh:  <http://www.w3.org/ns/shacl#> .
@prefix :    <https://w3id.org/example#> .

<#testValues>
    a              sh:NodeShape ;
    sh:targetClass :Researcher ;
    sh:message     "Researchers must belong to at least one named Association" ;
    sh:property    [ sh:path                :partOf ;
                     sh:qualifiedValueShape [ sh:class :Association ] ;
                     sh:qualifiedMinCount   1 ]
.
```

Compared to Exercise 8's rule ("at least one Organization"), this rule requires
at least one of the linked organizations to also be an `:Association`.

**`examples.yaml`**:

```yaml
examples:
- title: Researcher belonging to an Association
  snippets:
    - language: ttl
      ref: examples/example.ttl
```

**`examples/example.ttl`** — Fred now belongs to two organizations, one of
which is also an Association:

```turtle
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix :     <https://w3id.org/example#> .
@prefix eg:   <https://w3id.org/example-data#> .

eg:Fred
    a          :Researcher ;
    :partOf    eg:GnomesInc, eg:GardenersUnited ;
    rdfs:label "Fred the Gardener" .

eg:GnomesInc
    a          :Organization ;
    rdfs:label "Gnomes Inc. Gardeners to the Stars" .

eg:GardenersUnited
    a          :Organization , :Association ;
    rdfs:label "United Scientific Gardeners Association" .
```

**`tests/example-fail.ttl`** — Fred belongs to only a plain Organization (no
Association), so this must fail:

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

## Step 2: Run the postprocessor and inspect

This exercise has nothing to modify — the files are already complete. Run the
postprocessor and navigate to the **Exercise 9** block.

Open the **Examples** tab. You will see two sets of validation results:

1. The inherited rule from Exercise 8 ("Researchers must belong to at least one
   named Organization") — applied because of `dependsOn`.
2. The new rule from this block's own `rules.shacl` ("Researchers must belong
   to at least one named Association").

The valid example passes both: Fred belongs to GardenersUnited, which is both
an Organization (satisfying rule 1) and an Association (satisfying rule 2).

The negative test fails as expected: Fred only belongs to GnomesInc (an
Organization but not an Association), so rule 2 is violated. Open the
validation report to see both SHACL rule sets side by side — which nodes each
shape targeted, and the specific violation message for the failing test.

Also open the **Dependencies** tab to see the explicit link from this block to
Exercise 8.

## How it works

### `dependsOn` for model blocks

For schema blocks, profiling is expressed by using `$ref:
bblocks://some.block` inside `schema.yaml`. For model blocks there is no schema
file to put the reference in, so `dependsOn` in `bblock.json` serves the same
purpose:

```json
"dependsOn": ["ogc.bblocks.tutorial.exercise8"]
```

The postprocessor reads this declaration and:

1. Fetches all SHACL rules from `exercise8`.
2. Merges them with the rules in this block's own `rules.shacl`.
3. Applies the combined rule set to every example.

### Rule inheritance and composability

Inheriting SHACL rules from a parent model block means:

- You do not have to redeclare constraints that are already established.
- If the parent's rules change (to fix a bug or tighten a definition), your
  profile inherits the updated rules automatically on the next build.
- Your profile is provably more constrained than the parent — any data that
  passes your rules also passes the parent's rules.

### `sh:qualifiedValueShape` and `sh:qualifiedMinCount`

```turtle
sh:property [ sh:path                :partOf ;
              sh:qualifiedValueShape [ sh:class :Association ] ;
              sh:qualifiedMinCount   1 ]
```

`sh:qualifiedValueShape` lets you count how many of the values at a given path
satisfy a nested shape, independently of the total count. Here: "among all the
organizations Fred belongs to, at least one must be an `:Association`." This is
more expressive than `sh:minCount`, which would just count all `:partOf` links
regardless of their type.

---

## Summary

You have now worked through the full range of OGC Block capabilities:

| Exercise | What you built |
|---|---|
| 1 | Connected an example file to a block and triggered automatic JSON Schema validation |
| 2 | Added a JSON-LD context to map JSON properties to URIs, enabling semantic uplift to RDF |
| 3 | Added a SHACL rule that enforces a cross-property constraint on the RDF graph |
| 4 | Profiled an existing block with additional rules and wrote negative test cases |
| 5 | Wrapped your semantic model inside a standard GeoJSON Feature container |
| 6 | Referenced and profiled a block from an external published register |
| 7 | Declared data transforms (jq and SPARQL Update) that convert examples to other representations |
| 8 | Defined a model-type block with an OWL ontology and SHACL rules for Turtle data |
| 9 | Profiled an ontology block, inheriting its SHACL rules and adding stricter constraints |

Each capability is independent and composable: you can add a context without
SHACL rules, add SHACL rules without transforms, or combine all of them. The
block structure — `bblock.json`, `schema.yaml`, `context.jsonld`,
`rules.shacl`, `transforms.yaml`, `examples.yaml` — provides a consistent
place for each piece, and the postprocessor assembles them into a validated,
publishable artifact automatically.

For the next step — publishing your own block register and serving data through
it — see the [Applied OGC Blocks](../applied-ogc-blocks/introduction.md)
tutorial.
