---
sidebar_position: 3
title: "Create and validate data"
slug: /applied-ogc-blocks/2-create-and-validate
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create and validate data

With the block published, we can now create a concrete data document that
conforms to it, validate it against the schema, and semantically uplift it to
an RDF graph. This confirms that the block works as intended and gives us a
clean, machine-readable dataset to carry into Section 3.

## Write a conformant example

Create a new file called `sensor.json` in a working directory of your choice
(separate from the block repository). This document describes a single air
quality monitoring station with two observations:

```json
{
  "type": "Feature",
  "id": "stations/alpha",
  "geometry": {
    "type": "Point",
    "coordinates": [-3.70325, 40.41650]
  },
  "properties": {
    "name": "Station Alpha – Madrid Centro",
    "serialNumber": "AQS-2024-0042",
    "hasObservations": [
      {
        "observedProperty": "http://vocab.nerc.ac.uk/standard_name/mass_concentration_of_nitrogen_dioxide_in_air/",
        "hasResult": {
          "http://qudt.org/schema/qudt/value": 42.7,
          "http://qudt.org/schema/qudt/hasUnit": { "@id": "http://qudt.org/vocab/unit/MicroGM-PER-M3" }
        },
        "resultTime": "2024-06-01T12:00:00Z"
      },
      {
        "observedProperty": "http://vocab.nerc.ac.uk/standard_name/mass_concentration_of_pm10_ambient_aerosol_particles_in_air/",
        "hasResult": {
          "http://qudt.org/schema/qudt/value": 18.3,
          "http://qudt.org/schema/qudt/hasUnit": { "@id": "http://qudt.org/vocab/unit/MicroGM-PER-M3" }
        },
        "resultTime": "2024-06-01T12:00:00Z"
      }
    ]
  }
}
```

Let's walk through the structure:

**Top-level GeoJSON fields** — `type: "Feature"`, `geometry`, and `id` are
standard GeoJSON. The `id` uses a relative path notation (`stations/alpha`)
that will be resolved against a base URI during semantic uplift to produce the
full linked data URI for this resource.

**`name` and `serialNumber`** — the two custom properties we defined in the
block. Both have URI mappings in the JSON-LD context: `rdfs:label` and
`dcterms:identifier` respectively.

**`hasObservations`** — an array of SOSA Observation objects. Each observation
must include at least one of `hasResult` or `hasSimpleResult` (the schema
inherits this requirement from the SOSA Observation block). Here we use
`hasResult` with a structured result object that carries both the measured
value and its unit.

**`observedProperty`** — a URI that identifies *what* was measured. We use
[CF Standard Names](https://cfconventions.org/) served by the
[NERC Vocabulary Server](https://vocab.nerc.ac.uk/): resolving either URI
returns a human-readable description of the quantity; an RDF client would
receive a machine-readable vocabulary entry.

**`hasResult`** — a structured result object rather than a bare scalar.
Because [QUDT](https://qudt.org/) prefixes are not defined in the SOSA block's
inherited contexts, we reference its properties using their full URIs directly
as JSON keys — a valid JSON-LD technique for using predicates whose prefixes
are not declared in any active context:

- `http://qudt.org/schema/qudt/value` — the numeric measurement
- `http://qudt.org/schema/qudt/hasUnit` — the unit of measure, expressed as a
  URI reference using JSON-LD's `{"@id": "..."}` notation so that it is treated
  as an RDF resource rather than a plain string literal

:::note Choosing vocabularies for `observedProperty`
CF Standard Names are a natural fit for atmospheric observations, but your
domain may call for a different vocabulary. Other options for environmental
data include [QUDT Quantity Kinds](https://qudt.org/vocab/quantitykind/),
the [INSPIRE Feature Concept Dictionary](https://inspire.ec.europa.eu/featureconcept),
and [EnvThes](https://vocabs.lter-europe.net/envthes/). The key principle is
the same regardless of which vocabulary you use: the URI should be
dereferenceable and point to an authoritative definition of the concept.
:::

## Set up a Python virtual environment

Before installing any Python packages, create a virtual environment. A virtual
environment is an isolated Python installation for your project, which keeps its
dependencies separate from the rest of your system. This prevents version
conflicts between projects and makes it easy to clean up afterwards.

```bash
python -m venv .venv
```

Activate it:

<Tabs groupId="os">
<TabItem value="linux" label="Linux">

```bash
source .venv/bin/activate
```

</TabItem>
<TabItem value="macos" label="macOS">

```bash
source .venv/bin/activate
```

</TabItem>
<TabItem value="windows" label="Windows">

```powershell
.venv\Scripts\Activate.ps1
```

</TabItem>
</Tabs>

Your terminal prompt will change to show `(.venv)`, indicating the environment
is active. All `pip install` commands from this point forward will install into
the virtual environment only.

## Install `bblocks-client-python`

```bash
pip install "bblocks_client[all]"
```

The `[all]` extra includes RDF support (via `rdflib`), which is needed for
semantic uplift.

## Load the register and validate

Create a file called `validate.py` and paste in the following script:

```python
from ogc.bblocks.register import load_register
from ogc.bblocks.validate import validate_json
from ogc.bblocks.semantic_uplift import uplift_json
import json

# -----------------------------------------------------------------------
# 1. Load your published block register from GitHub Pages.
#    Replace {your-github-username} with your actual GitHub username.
# -----------------------------------------------------------------------
register = load_register(
    "https://{your-github-username}.github.io/my-bblocks-register/build/register.json"
)

# -----------------------------------------------------------------------
# 2. Retrieve the air quality sensor block by its identifier.
#    The ID is: identifier-prefix (from bblocks-config.yaml)
#               + directory name (inside _sources/)
# -----------------------------------------------------------------------
bblock = register.get_item_full("r1.tutorial.sensors.airQualitySensor")

# -----------------------------------------------------------------------
# 3. Read the example document.
# -----------------------------------------------------------------------
with open("sensor.json") as f:
    sensor = json.load(f)

# -----------------------------------------------------------------------
# 4. Validate against the block's JSON Schema.
#    raise_for_invalid() raises a ValidationError if the document does
#    not conform.
# -----------------------------------------------------------------------
result = validate_json(bblock, sensor)
result.raise_for_invalid()
print("Validation passed!")

# -----------------------------------------------------------------------
# 5. Semantically uplift: apply the block's JSON-LD context to produce
#    an RDF graph.
#    base_uri is prepended to relative `id` values to form absolute URIs.
# -----------------------------------------------------------------------
rdf_graph = uplift_json(bblock, sensor, base_uri="https://example.com/sensors/")

# Inspect the result as Turtle
print(rdf_graph.serialize(format="turtle"))
```

Replace `{your-github-username}` with your actual GitHub username, then run
the script:

```bash
python validate.py
```

## Understanding the output

### The block identifier

`load_register` fetches `register.json` from your GitHub Pages URL and makes all
the blocks it describes available for lookup. `get_item_full` retrieves a single
block by its full identifier.

The identifier `r1.tutorial.sensors.airQualitySensor` is composed of:

| Part | Origin |
|---|---|
| `r1.tutorial.sensors.` | `identifier-prefix` in `bblocks-config.yaml` |
| `airQualitySensor` | Directory name inside `_sources/` |

If validation fails, `raise_for_invalid()` will print a list of schema errors
with the JSON path of each failing field, helping you pinpoint the problem.

### The `base_uri` argument

`uplift_json` applies the block's JSON-LD context to `sensor.json` and returns
an `rdflib.Graph` object containing the resulting RDF triples. The `base_uri`
argument is prepended to any relative `id` values to produce full URIs for the
resources in the graph.

With `base_uri="https://example.com/sensors/"`, the feature's `id` of
`stations/alpha` becomes `https://example.com/sensors/stations/alpha`.
In Section 3, pygeoapi will manage the URIs for published features itself, so
this `base_uri` is used here only for local inspection.

:::note Example URIs are not real addresses
`https://example.com/sensors/` is a tutorial placeholder. In a production
deployment, this would be a URI namespace you actually control — either a domain
your organization owns or a persistent URI service such as
[w3id.org](https://w3id.org). See the epilogue of Section 3 for more details.
:::

### The Turtle output

If validation passes, the script will print the uplifted RDF graph in Turtle
format. The output will look roughly like this:

```turtle
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix rdfs:    <http://www.w3.org/2000/01/rdf-schema#> .
@prefix sosa:    <http://www.w3.org/ns/sosa/> .
@prefix xsd:     <http://www.w3.org/2001/XMLSchema#> .

<https://example.com/sensors/stations/alpha>
    a <https://purl.org/geojson/vocab#Feature> ;
    rdfs:label "Station Alpha – Madrid Centro" ;
    dcterms:identifier "AQS-2024-0042" ;
    sosa:isFeatureOfInterestOf
        <https://example.com/sensors/stations/alpha/hasObservations/0>,
        <https://example.com/sensors/stations/alpha/hasObservations/1> .

<https://example.com/sensors/stations/alpha/hasObservations/0>
    sosa:hasResult [
        <http://qudt.org/schema/qudt/hasUnit> <http://qudt.org/vocab/unit/MicroGM-PER-M3> ;
        <http://qudt.org/schema/qudt/value> 4.27e+01
    ] ;
    sosa:observedProperty
        <http://vocab.nerc.ac.uk/standard_name/mass_concentration_of_nitrogen_dioxide_in_air/> ;
    sosa:resultTime "2024-06-01T12:00:00Z"^^xsd:dateTime .

<https://example.com/sensors/stations/alpha/hasObservations/1>
    sosa:hasResult [
        <http://qudt.org/schema/qudt/hasUnit> <http://qudt.org/vocab/unit/MicroGM-PER-M3> ;
        <http://qudt.org/schema/qudt/value> 1.83e+01
    ] ;
    sosa:observedProperty
        <http://vocab.nerc.ac.uk/standard_name/mass_concentration_of_pm10_ambient_aerosol_particles_in_air/> ;
    sosa:resultTime "2024-06-01T12:00:00Z"^^xsd:dateTime .
```

Notice what has happened:

- The feature's `name` has become `rdfs:label` and `serialNumber` has become
  `dcterms:identifier` — the mappings from our `context.jsonld`.
- The `hasObservations` array has become `sosa:isFeatureOfInterestOf` links from
  the station to its observation nodes — as declared in our context.
- Inside each observation, `hasResult`, `observedProperty`, and `resultTime`
  have become `sosa:hasResult`, `sosa:observedProperty`, and `sosa:resultTime`
  — inherited automatically from the SOSA Observation block's own context.
- The `hasResult` object becomes a blank node with two predicates expressed as
  full URIs — `<http://qudt.org/schema/qudt/value>` and
  `<http://qudt.org/schema/qudt/hasUnit>` — exactly as written in the JSON
  source. The unit, declared with `{"@id": "..."}`, resolves to a URI resource
  rather than a string literal.
- The `observedProperty` values are dereferenceable CF Standard Name URIs.
  Any system familiar with the NERC Vocabulary Server can resolve them to
  retrieve authoritative definitions of the quantities being measured.

The plain JSON property names are gone; what remains is an unambiguous,
machine-readable graph of statements that any RDF-capable system can interpret,
query, and integrate with other linked data.

## Optional: add the example to the block

Once you are satisfied that the data is valid, it is good practice to add it as
a canonical example inside the block itself. This allows the postprocessor to
validate it automatically on every build and makes it immediately visible in the
block viewer.

Copy `sensor.json` into the block directory:

```bash
cp sensor.json /path/to/my-bblocks-register/_sources/airQualitySensor/sensor.json
```

Then create `_sources/airQualitySensor/examples.yaml`:

```yaml
examples:
  - title: Station Alpha – Madrid Centro
    content: >
      A fixed air quality monitoring station in central Madrid, with NO₂ and
      PM10 observations.
    base-uri: https://example.com/sensors/
    snippets:
      - language: json
        ref: sensor.json
```

The `base-uri` field tells the postprocessor what URI to use as the base when
uplifting the example during the build. Commit and push these two files to see
the example appear under the block's **Examples** tab in the viewer.

## Summary

You now have a validated, semantically annotated data document that:

- Conforms to the air quality sensor station block's JSON Schema
- Has been uplifted to an RDF graph where every field carries its full
  URI-based meaning
- Shows how the inherited SOSA and GeoJSON contexts compose automatically with
  the custom context from the block

Next: [Section 3 – Serve and visualize the data](./section-3.md).
