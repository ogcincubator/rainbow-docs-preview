---
sidebar_position: 3
title: "Exercise 2: Semantic annotation with JSON-LD"
slug: /ogc-blocks-core-capabilities/exercise-2
---

# Exercise 2: Semantic annotation with JSON-LD

A JSON Schema describes the *structure* of data — the field names, types, and
constraints. It says nothing about what those fields *mean*. Two schemas can
both have a field called `b` that is a number, and there is no way to tell
from the schema whether they refer to the same concept or completely different
ones.

JSON-LD solves this by attaching a *context* to a JSON document: a dictionary
that maps each property name to a URI identifying the concept it represents.
Once every field has a URI, any RDF-capable tool can interpret, merge, and
reason over the data — regardless of what the fields happen to be called.

In an OGC Block, the context lives in `context.jsonld`. When the postprocessor
finds this file, it applies it to every JSON example in the block, generates
the resulting RDF, and makes both the context and the Turtle output available
in the viewer.

## Step 1: Create the exercise files

Create the directory `_sources/exercise2/` and add the following files.

**`bblock.json`**:

```json
{
  "name": "Exercise 2: Semantic annotation with JSON-LD",
  "abstract": "Adding a JSON-LD context to map JSON properties to URIs.",
  "itemClass": "schema",
  "status": "under-development",
  "dateTimeAddition": "2024-01-01T00:00:00Z",
  "version": "0.1",
  "dateOfLastChange": "2024-01-01"
}
```

**`schema.yaml`** (same schema as Exercise 1):

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

Run the postprocessor. Navigate to the **Exercise 2** block in the viewer.
The block validates against the schema, but there is no **Semantic Uplift**
tab — no JSON-LD context has been defined yet.

## Step 2: Add the context and rebuild

Create `_sources/exercise2/context.jsonld`:

```json
{
  "@context": {
    "mynamespace": "http://example.com/mythings/",
    "a": "@type",
    "b": "https://example.org/my-bb-model/b",
    "c": "https://example.org/my-bb-model/c"
  }
}
```

The postprocessor looks for `context.jsonld` by name and applies it to every
JSON example automatically — no other change is needed.

Rerun the postprocessor and reload the viewer. Navigate to the **Exercise 2**
block and open the **Semantic Uplift** tab. You will see the composed JSON-LD
context and, for each example, the uplifted RDF graph in Turtle format.

The Turtle output for the example (`"a": "mynamespace:aThing"`, `"b": 23`,
`"c": 1`) will look roughly like this:

```turtle
@prefix ns1: <https://example.org/my-bb-model/> .

[]  a    <http://example.com/mythings/aThing> ;
    ns1:b 23 ;
    ns1:c 1 .
```

The subject is a blank node (`[]`) because the example JSON has no `@id`
property. The `"a": "@type"` mapping turns the value into an RDF type
assertion on that blank node — `"a"` does not identify the subject, it
classifies it.

## How it works

### URI mappings

Each entry in `@context` maps a JSON key to a URI:

```json
"b": "https://example.org/my-bb-model/b"
```

This tells any JSON-LD processor: wherever the key `b` appears, treat its
value as a statement using the predicate
`https://example.org/my-bb-model/b`. The field name `b` is now just a
shorthand; the actual identity of the concept is the URI.

### Mapping to `@type`

```json
"a": "@type"
```

This is a special mapping: it tells the JSON-LD processor that the value of
`a` is the RDF *type* of the enclosing object. In the example, `"a":
"mynamespace:aThing"` therefore becomes `rdf:type mynamespace:aThing` —
making the object an instance of the `aThing` class. This is how Exercise 3's
SHACL rule will be able to target objects of that class.

### Namespace prefixes

```json
"mynamespace": "http://example.com/mythings/"
```

This declares `mynamespace` as a prefix, so `mynamespace:aThing` expands to
`http://example.com/mythings/aThing`. Prefix declarations make contexts more
readable when property values reference URIs in the same namespace.

### What the postprocessor does with the context

When the postprocessor finds `context.jsonld`, it:

1. Applies the context to every JSON example declared in `examples.yaml`.
2. Produces the uplifted RDF graph for each example.
3. Writes both the context and the RDF to the `build-local/` output so the
   viewer can display them.

If the block inherits contexts from blocks it references via `$ref`, those
contexts are merged automatically — you only need to declare the mappings
that are new to your block.

---

Next: [Exercise 3 — Semantic validation with SHACL](./section-3.md).
