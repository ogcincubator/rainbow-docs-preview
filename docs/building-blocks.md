---
sidebar_position: 2
title: Building Blocks
---

# Building Blocks

Reusable, scale-independent specification components from which standards and profiles are composed. The primary vehicle for consistency, extensibility, and machine-interpretable semantics.

## What Is a Building Block?

A building block encapsulates a coherent piece of specification — a data model fragment, a set of constraints, an API operation pattern, a code list, a conceptual element — packaged for independent reuse. Building blocks follow standardized patterns for reuse, whether they encapsulate a single concept or aggregate multiple lower-level building blocks into a higher-order component.

This recursive composition continues until foundational-level concepts are organized into common patterns that solve real problems. The reusability of this methodology within an application domain defines the common interface between the standards ecosystem and communities of practice.

:::note The Core Problem Building Blocks Solve
Multiple standards often define overlapping concepts — temporal properties, spatial geometry, contact information, provenance metadata — with subtle differences that create unnecessary friction. Building blocks allow these common elements to be defined once, maintained in one place, and reused wherever needed with guaranteed consistency.
:::

## Building Block Anatomy {#anatomy}

A building block is more than a schema fragment. It is a self-contained package with all of the components needed for independent validation, testing, and versioning.

![Building Block anatomy diagram](/img/building-block-anatomy.svg)

The separation of concerns — between schemas, semantic mappings, and transformation specifications — is deliberate and architecturally significant. It allows two different building blocks to map the same schema to different ontologies for different communities, or for building blocks to contain only transformation specifications without schemas. This modularity maximizes reuse and avoids forcing false coupling between concerns that may evolve independently.

## Composition Patterns {#composition}

Standards and profiles are composed from building blocks using several defined patterns. All composition operations are declared in the machine-readable dependency graph, enabling automated tools to resolve, validate, and visualize the full structure.

| Pattern | Description |
|---|---|
| **Aggregation** | Assembles multiple building blocks side by side. A feature standard might aggregate a geometry BB, a temporal BB, and a metadata BB. Each retains its identity and constraints; the standard adds the binding logic. |
| **Refinement** | Takes an existing building block and narrows it. A domain-specific feature type BB might refine the generic geometry BB to mandate a specific geometry type (e.g., Polygon only) and a specific CRS. |
| **Extension** | Takes an existing building block and adds new elements. A provenance BB might extend the generic metadata BB with lineage and processing step information. |
| **Substitution** | Replaces one building block with another providing the same interface but different behavior. A high-performance geometry BB using DGGS encoding might replace the standard WKT geometry BB. |

## The OGC Building Blocks Framework {#framework}

Each building block in the OGC implementation follows a standard directory structure with specific artifacts:

| Artifact | Purpose |
|---|---|
| `bblock.json` | Machine-readable metadata: identity, scope, dependencies (`dependsOn` entries as URIs in the OGC Building Blocks register), status, and governance information. |
| `schema.yaml` | JSON Schema definition for the building block's data model. Supports `$ref` composition for aggregation with other building blocks. |
| `context.jsonld` | JSON-LD context for semantic uplift — maps JSON property names to RDF predicates and ontology URIs. Enables SPARQL querying of uplifted data. |
| `shapes.shacl` | SHACL shapes for content and logical constraint validation beyond what JSON Schema can express. Uses `shaclClosures` for vocabulary validation. |
| `semantic-uplift.yaml` | Pre-processing (JQ) and post-processing (SPARQL CONSTRUCT) transforms for restructuring data before/after JSON-LD context application. |
| `examples.yaml` | Reference instances — both conformant and deliberately non-conformant — automatically tested in the CI pipeline. |
| `tests/` | Test directory with positive and negative cases. The CI pipeline validates the entire chain: schema → JSON-LD → SHACL, in one pass. |

For full documentation of the Building Blocks framework, see [ogcincubator.github.io/bblocks-docs](https://ogcincubator.github.io/bblocks-docs/).

## Why Building Blocks Change Standards Development

- **Define Once, Reuse Everywhere** — Common concepts — temporal properties, spatial geometry, contact information, provenance — defined in one place and reused with guaranteed consistency across all standards that need them.
- **Extend Without Breaking** — Communities create new building blocks rather than modifying existing ones. New blocks can be registered and shared with others facing similar needs, growing a library of composable components.
- **Transparent Bill of Materials** — The composition of any standard or profile can be inspected to see exactly which building blocks it uses, which versions, and how they are constrained or extended in context.
- **Independent Versioning & Validation** — Each building block can be independently validated, tested, and versioned. CI pipelines catch breakage immediately. Schema, semantics, and transforms evolve at their own pace.
- **AI-Interpretable Semantics** — JSON-LD contexts and SHACL shapes make building blocks machine-interpretable, not merely machine-readable. AI agents can operate on explicit components rather than inferring intent from prose.
- **Federated Registries** — Communities can build their own registries or contribute to the OGC community. Registers can be federated to create scalable ecosystems across organizational boundaries.
