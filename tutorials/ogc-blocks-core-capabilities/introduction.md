---
sidebar_position: 1
title: "OGC Blocks: Core Capabilities"
sidebar_label: Introduction
slug: /ogc-blocks-core-capabilities/introduction
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# OGC Blocks: Core Capabilities

Every data format project eventually hits the same wall. You define a schema,
your partners define theirs, and then someone has to write a mapping — and
the mappings multiply every time a new partner joins. The field names differ,
the structures differ, and even when the underlying concepts are identical,
the representations are not.

[OGC Blocks](https://blocks.ogc.org) address this at the source. A block is not
just a schema; it is a self-contained specification unit that bundles together
everything a consumer needs to understand, validate, and transform the data:

- A **[JSON Schema](https://json-schema.org/)** that defines the structure —
  field types, required properties, and value constraints
- A **[JSON-LD](https://json-ld.org/) context** that maps each field to a
  globally unique URI. Applying the context converts the JSON document into an
  **[RDF](https://www.w3.org/RDF/)** graph (typically serialised as
  **[Turtle](https://www.w3.org/TR/turtle/)**), where every field is identified
  by its URI rather than its local name — giving it unambiguous meaning
  regardless of what it is called in any particular format
- **[SHACL](https://www.w3.org/TR/shacl/)** (Shapes Constraint Language)
  **rules** that express logical constraints over the RDF graph — things JSON
  Schema alone cannot check, like "this value must be less than that other
  value" or "this resource must be related to at least one instance of this
  class"
- **Transforms** that convert data to other representations —
  **[jq](https://jqlang.github.io/jq/)** for JSON-to-JSON restructuring,
  **[SPARQL Update](https://www.w3.org/TR/sparql11-update/)** for RDF graph
  manipulation, **[XSLT](https://www.w3.org/TR/xslt/)** for XML
- **Examples** that are validated automatically on every build, so conformance
  is always tested, not just assumed
- An optional **[OWL](https://www.w3.org/TR/owl2-overview/)** ontology for
  *model blocks* — a formal description of concepts and their relationships,
  used when the block defines a semantic data model rather than a JSON schema
- **Documentation** that travels with the block, making it self-describing

Blocks live in a `_sources/` directory in your repository. A *postprocessor*
compiles them into a published register, resolving all references, running
validations, and generating documentation. The exercises use a local Docker
workflow so you can run the postprocessor and inspect results on your machine
before publishing anything.

This tutorial systematically covers each of these capabilities, one exercise at
a time. Unlike the [Applied OGC Blocks](../applied-ogc-blocks/introduction.md)
tutorial — which builds one complete end-to-end system — this tutorial isolates
each feature so you can understand exactly what it contributes.

## The running example

All exercises in this tutorial use the same minimal data model: an object with
three properties, `a`, `b`, and `c`. This is intentional. The data model never
changes; what changes is the layer of capability added around it in each
exercise. That isolation lets you focus on the new concept without having to
understand a new domain at the same time.

The starting schema looks like this:

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

By the end of the tutorial you will have added semantic annotation,
SHACL-based validation, GeoJSON Feature packaging, cross-register profiling,
and data transforms — all on top of this same three-property object.

## How the exercises work

Each exercise in this tutorial asks you to create a block from scratch in two
steps:

1. **Set up**: you create the block directory with a working but incomplete
   block — enough to build and inspect, but missing one capability.
2. **Add it**: you create or complete one file, rebuild, and observe what
   changes in the viewer.

This structure makes the consequences of each addition immediately visible. You
see what the block looks like without the feature first, then with it, so the
purpose of each file and each configuration line is concrete rather than
abstract.

Some exercises build directly on earlier ones. Exercises 4 and 5 profile blocks
from Exercises 3 and 4 respectively, and Exercise 9 profiles the block from
Exercise 8 — so those exercises must be completed in order. Exercises 1–3,
6, 7, and 8 are standalone.

If you get stuck, the
[bblocks-tutorial](https://github.com/ogcincubator/bblocks-tutorial)
repository contains reference implementations of all exercises. Note that it
uses a different `bblocks-config.yaml` and identifier prefix, so the block
file contents (schemas, contexts, SHACL rules) match, but any cross-exercise
`$ref` and `dependsOn` values will differ from the ones used here.

## Prerequisites

- A working **Docker** environment. Installation instructions are available on
  the [Docker Desktop website](https://docs.docker.com/desktop/).
- A **GitHub account** and basic familiarity with Git (`clone`, `add`, `commit`,
  `push`). If you are new to Git, the
  [GitHub Quickstart](https://docs.github.com/en/get-started/quickstart) is a
  good starting point.
- Basic familiarity with JSON and YAML.

## Set up your register

This tutorial uses the
[bblock-template](https://github.com/opengeospatial/bblock-template) as the
starting point for your own block register.

1. Open [bblock-template](https://github.com/opengeospatial/bblock-template)
   on GitHub.
2. Click **Use this template → Create a new repository**.
3. Name the repository (e.g., `bblocks-tutorial`), keep it **public**, and
   click **Create repository**.
4. Clone your new repository:

```bash
git clone https://github.com/{your-github-username}/bblocks-tutorial.git
cd bblocks-tutorial
```

5. Open `bblocks-config.yaml` and replace its contents with:

```yaml
name: My OGC Blocks tutorial
identifier-prefix: ogc.bblocks.tutorial.
imports:
  - default
  - https://ogcincubator.github.io/topo-feature
```

The `identifier-prefix` is prepended to the path of every block in
`_sources/`. The `default` import gives you access to standard OGC blocks
(including the GeoJSON Feature block used in Exercise 5). The `topo-feature`
import is needed for Exercise 6.

6. Remove the example block that comes with the template:

<Tabs groupId="os">
<TabItem value="linux" label="Linux / macOS">

```bash
rm -rf _sources/my-bb
```

</TabItem>
<TabItem value="windows" label="Windows">

```powershell
Remove-Item -Recurse -Force _sources\my-bb
```

</TabItem>
</Tabs>

Your repository is now ready. Each exercise will add a new subdirectory under
`_sources/`.

## The local build workflow

You will repeat this workflow after every change you make to an exercise.

### Step 1: Run the postprocessor

The postprocessor validates your blocks, resolves all references and inherited
schemas, applies JSON-LD contexts, runs SHACL rules, and writes the results
to `build-local/`.

<Tabs groupId="os">
<TabItem value="linux" label="Linux / macOS">

```bash
docker run --pull=always --rm --workdir /workspace \
  -v "$(pwd):/workspace" \
  ghcr.io/opengeospatial/bblocks-postprocess \
  --clean true --base-url http://localhost:9090/register/
```

</TabItem>
<TabItem value="windows" label="Windows">

```powershell
docker run --pull=always --rm --workdir /workspace `
  -v "${PWD}:/workspace" `
  ghcr.io/opengeospatial/bblocks-postprocess `
  --clean true --base-url http://localhost:9090/register/
```

</TabItem>
</Tabs>

The `--base-url` flag sets the public URL prefix used in all generated
artifacts, making them compatible with the local viewer. Output goes to
`build-local/` (not tracked by git).

### Step 2: Start the viewer

Keep the viewer running in a separate terminal while working through the
exercises. You only need to start it once; it reads the `build-local/` output
each time you reload your browser.

<Tabs groupId="os">
<TabItem value="linux" label="Linux / macOS">

```bash
docker run --rm --pull=always \
  -v "$(pwd):/register" \
  -p 9090:9090 \
  ghcr.io/ogcincubator/bblocks-viewer
```

</TabItem>
<TabItem value="windows" label="Windows">

```powershell
docker run --rm --pull=always `
  -v "${PWD}:/register" `
  -p 9090:9090 `
  ghcr.io/ogcincubator/bblocks-viewer
```

</TabItem>
</Tabs>

Open [http://localhost:9090](http://localhost:9090) in your browser. You will
see a list of all blocks in the register — one for each exercise you have
created so far.

### Step 3: Inspect the results

Click on a block to open its detail page. The tabs you will use throughout
this tutorial are:

| Tab | What it shows |
|---|---|
| **Overview** | Block metadata, abstract, and description |
| **JSON Schema** | The fully resolved schema, including all inherited content |
| **Semantic Uplift** | The composed JSON-LD context and the resulting RDF output for each example |
| **Examples** | Validation results for each declared example |
| **Dependencies** | The block's dependency graph, derived from `isProfileOf` and `imports` |
| **Transforms** | Input/output pairs for any declared transforms |
| **Ontology** | The OWL ontology (for model-type blocks only) |

## Block anatomy reference

Throughout the exercises you will encounter these files. Refer back to this
table whenever you need a reminder of what each one does.

| File | Purpose |
|---|---|
| `bblock.json` | Block metadata: name, status, tags, dependencies, item type |
| `schema.yaml` | JSON Schema definition |
| `context.jsonld` | JSON-LD context mapping JSON property names to URIs |
| `rules.shacl` | SHACL shapes for semantic validation |
| `transforms.yaml` | Transform definitions (jq, SPARQL Update, XSLT) |
| `examples.yaml` | Manifest listing the block's examples and test cases |
| `examples/` | Example data files (must pass validation) |
| `tests/` | Validation tests not shown in public documentation. Files whose name ends in `-fail` are *negative tests* — they must fail validation, and the report marks them as passed when they do. Files without the `-fail` suffix are positive tests, validated the same way as files in `examples/` but kept out of the public docs. |
| `description.md` | Human-readable block documentation |

## Tutorial map

| Section | Exercise | Topic |
|---|---|---|
| [1](./section-1.md) | Exercise 1 | Examples management and JSON Schema validation |
| [2](./section-2.md) | Exercise 2 | Semantic annotation with JSON-LD |
| [3](./section-3.md) | Exercise 3 | Semantic validation with SHACL |
| [4](./section-4.md) | Exercise 4 | Profiling a block and writing unit tests |
| [5](./section-5.md) | Exercise 5 | Packaging semantics in a GeoJSON Feature |
| [6](./section-6.md) | Exercise 6 | Importing from an external register |
| [7](./section-7.md) | Exercise 7 | Transforms (+ advanced example) |
| [8](./section-8.md) | Exercise 8 | RDF-only blocks: OWL ontologies |
| [9](./section-9.md) | Exercise 9 | Profiling an ontology |

Ready? Start with [Exercise 1](./section-1.md).
