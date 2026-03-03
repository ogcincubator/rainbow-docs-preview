---
sidebar_position: 1
title: "Applied OGC Blocks: Introduction"
sidebar_label: Introduction
slug: /applied-ogc-blocks/introduction
---

# Applied OGC Blocks: from definition to data publishing

Imagine you are building a network of air quality monitoring stations. Each station
measures nitrogen dioxide, particulate matter, and other pollutants, and reports its
readings as structured JSON. You define a schema for your API, deploy it, and share
data with partners.

Six months later, a partner organization wants to integrate their sensor network with
yours. They also have a JSON schema — but they call the same field `observations`
instead of `hasObservations`, `no2` instead of `nitrogenDioxide`, and `stationId`
instead of `id`. The underlying concepts are identical, but the formats are not,
and someone has to write a custom mapping. Then the next partner arrives, and the
process starts again — and if that partner happens to be Finnish, their field
for "observations" is `havainnot`.

This is not an edge case. It is the default state of data sharing. It repeats every
time two independently designed systems need to exchange data, and it creates a
compounding maintenance burden as ecosystems grow.

**[OGC Blocks](https://blocks.ogc.org)** address this at the source. An OGC Block
is not just a schema — it is a complete, reusable specification component that
packages together:

- A **JSON Schema** that precisely defines the structure of a data format.
- **Validation rules** that let any consumer verify whether a document conforms to
  the schema, automatically and without manual review.
- **Semantic annotations** in the form of a JSON-LD context that gives every field
  a globally unique, resolvable identity — a URI linking it to an authoritative
  concept in a shared vocabulary.
- **Documentation and examples** that travel alongside the schema, making it
  self-describing.

When two datasets both map their fields to the same standard vocabulary URIs, a
machine can integrate them automatically — regardless of the field names chosen
by each format. The meaning is embedded in the data, not left as implicit knowledge
known only to the original authors. For a complete technical reference, see the
[OGC Blocks documentation](https://ogcincubator.github.io/bblocks-docs/).

## The scenario

In this tutorial we will define and publish a Block for **air quality sensor
stations**: fixed monitoring points that continuously record atmospheric observations.
A sensor station is naturally modeled as a GeoJSON Feature — it has a geographic
location and a set of properties. Its observations conform to the **[SOSA/SSN](https://w3c.github.io/sdw-sosa-ssn/ssn/)**
standard (the W3C Sensor, Observation, Sample, and Actuator ontology, adopted by
the OGC), which provides a well-established, interoperable model for describing
what was observed, with what sensor, and at what time.

Rather than building our Block from scratch, we will extend existing, published
Blocks. Our schema will extend the standard **OGC GeoJSON Feature** Block and
embed **SOSA Observation** objects directly inside the feature's properties. The
semantic annotations for those inherited structures come for free — we only need
to define mappings for the new fields we introduce ourselves.

The result is a published Block that any partner can reference, validate data
against, or extend for their own purposes.

## What you will learn

- How to create a new OGC Block repository from the official template
- How to configure a block register and import external block dependencies
- How to define a JSON Schema that extends an existing block and embeds SOSA
  observations
- How to write a JSON-LD context that semantically annotates your schema fields
- How to build and preview a block register locally using Docker, and publish it
  via GitHub Actions and GitHub Pages
- How to validate JSON data against your block and convert it to an RDF graph
  using `bblocks-client-python`
- How to serve your data through a semantics-aware API using a custom
  `pygeoapi` instance that resolves vocabulary terms for every field

## Prerequisites

- A working **Docker** environment. Installation instructions are available on
  the [Docker Desktop website](https://docs.docker.com/desktop/).
- A working **Python 3** environment (3.9 or later). We recommend the official
  distribution from [python.org](https://www.python.org/downloads/).
- A **GitHub account** and basic familiarity with Git (`clone`, `add`, `commit`,
  `push`). If you are new to Git, the
  [GitHub Quickstart](https://docs.github.com/en/get-started/quickstart) is a
  good starting point.

## Linked data: key terms

If you are new to linked data, these terms will appear throughout the tutorial:

- **URI** (Uniform Resource Identifier) — a string that globally and uniquely
  identifies a concept. In linked data, every term, property, and resource has
  a URI. URIs that can be looked up on the web (like `https://...`) are
  called *dereferenceable*, meaning you can retrieve a description of the
  concept they identify.
- **RDF** (Resource Description Framework) — the W3C standard for representing
  information as a graph of statements. Each statement is a *triple*: a subject,
  a predicate (property), and an object
  (e.g. *Station Alpha → has name → "Station Alpha – Madrid Centro"*).
- **Turtle** — a compact, human-readable text format for writing RDF graphs.
- **JSON-LD** — a way of giving ordinary JSON documents RDF semantics by
  attaching a *context*: a dictionary that maps JSON property names to their
  corresponding URIs. A JSON-LD file is still valid JSON and can be processed
  by any JSON tool, but it can also be parsed as an RDF graph by any linked
  data tool.
- **Semantic uplift** — the process of applying a JSON-LD context to a JSON
  document to produce an RDF graph. The data *stays the same*; what changes
  is whether the system reading it understands the global meaning of each field.
- **[SOSA/SSN](https://w3c.github.io/sdw-sosa-ssn/ssn/)** — the W3C Sensor, Observation, Sample, and Actuator ontology.
  It defines concepts such as `Observation`, `Sensor`, `FeatureOfInterest`, and
  `observedProperty` in a way that is understood by any system familiar with
  the standard.

## How this tutorial is organized

| Section | What it covers |
|---|---|
| [Section 1: Define your OGC Block](./section-1.md) | Creating a block repository, writing the schema and JSON-LD context, and publishing via GitHub |
| [Section 2: Create and validate data](./section-2.md) | Writing conformant data, validating it with Python, and inspecting the uplifted RDF graph |
| [Section 3: Serve and visualize the data](./section-3.md) | Configuring a semantics-aware pygeoapi instance and browsing semantically enriched data |

Ready? Continue to [Section 1](./section-1.md).
