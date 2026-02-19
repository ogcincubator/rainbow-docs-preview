---
sidebar_position: 3
title: "Define the indicator"
---

# Define the indicator

In this section we describe the Composite Drought Indicator as a
**provenance chain**: a machine-readable record of which observations were
used and how the indicator was derived from them.

## The Provenance Chain OGC Building Block

OGC Building Blocks are reusable specification components that
provide a schema, JSON-LD context, and validation rules for a given data
structure. We will use the **Provenance Chain BBlock**, which is based on
the W3C PROV-O ontology and extends it for geospatial use.

![OGC Block for provenance schema](./assets/bblock-prov-schema.png)

The register for the provenance schemas is available at https://ogcincubator.github.io/bblock-prov-schema/ .

Out of the different available Blocks, we will use the ["Provenance Chain"](https://ogcincubator.github.io/bblock-prov-schema/bblock/ogc.ogc-utils.prov) 
one, which is very flexible since it allows us to define a provenance chain starting
from an entity, an activity or an agent.

The [JSON Schema](https://ogcincubator.github.io/bblock-prov-schema/bblock/ogc.ogc-utils.prov/examples)
tab shows the full (semantically annotated) JSON Schema. You can find examples to get started under [Examples](https://ogcincubator.github.io/bblock-prov-schema/bblock/ogc.ogc-utils.prov/examples);
the full [provenance chain example](https://ogcincubator.github.io/bblock-prov-schema/bblock/ogc.ogc-utils.prov/examples) illustrates many
of the available properties.

![Examples for provenance chain](./assets/bblock-prov-schema-example.png)

## Writing the provenance chain

Create a file called `cdi-indicator.json`. The document describes:

1. The **indicator entity** (the CDI value itself)
2. The **computation activity** that generated it
3. The three **input entities** (observations) that the activity used

:::caution Review required
The JSON below is a best-guess adaptation of the BBlock schema. Review the
`featureType` values and `@context` URIs against the actual schema before use.
:::

```json
{
  "id": "indicators/cdi/station-alpha/2024-07",
  "type": "Feature",
  "featureType": "CompositeIndicator",
  "name": "Composite Drought Indicator – Station Alpha – July 2024",
  "wasGeneratedBy": {
    "id": "act:cdi-computation/station-alpha/2024-07",
    "activityType": "CompositeIndicatorComputation",
    "name": "CDI computation – Station Alpha – July 2024",
    "endedAtTime": "2024-08-01T00:00:00Z",
    "used": [
      {
        "id": "obs:soil-moisture-anomaly/station-alpha/2024-07",
        "featureType": "SoilMoistureAnomaly",
        "name": "Soil Moisture Anomaly – Station Alpha – July 2024"
      },
      {
        "id": "obs:rainfall-anomaly/station-alpha/2024-07",
        "featureType": "RainfallAnomaly",
        "name": "Rainfall Anomaly – Station Alpha – July 2024"
      },
      {
        "id": "obs:vegetation-condition-anomaly/station-alpha/2024-07",
        "featureType": "VegetationConditionAnomaly",
        "name": "Vegetation Condition Anomaly – Station Alpha – July 2024"
      }
    ]
  }
}
```

## Validating and uplifting with bblocks-client-python

The `bblocks-client-python` library validates the document against the BBlock
schema and **semantically uplifts** it: it applies the JSON-LD context to
produce a full RDF graph, which is what we will store in Fuseki.

Install the library with RDF support:

```bash
pip install "bblocks_client[all]"
```

Then run the following script:

:::caution Review required
The import paths and function names below are based on the README at
https://github.com/ogcincubator/bblocks-client-python — verify against the
installed version.
:::

```python
# TODO: review import paths and function signatures against installed version
from ogc.bblocks.register import load_register
from ogc.bblocks.validate import validate_json
from ogc.bblocks.semantic_uplift import uplift_json
import json

# Load the provenance chain building block
register = load_register(
    "https://ogcincubator.github.io/bblock-prov-schema/build/register.json"
)
bblock = register.get_item_full("ogc.ogc-utils.prov")

# Read the indicator document
with open("cdi-indicator.json") as f:
    indicator = json.load(f)

# Validate against the schema
result = validate_json(bblock, indicator)
result.raise_for_invalid()  # raises an exception if validation fails
print("Validation passed!")

# Uplift: apply JSON-LD context to produce an RDF graph
# We provide the base_uri so that the identifiers of the
# resources are converted to proper URIs
rdf_graph = uplift_json(bblock, indicator, base_uri='https://example.com/rainbow/')

# Serialize as Turtle for upload to Fuseki
rdf_graph.serialize('cdi-indicator.ttl')

print("Uplift complete → cdi-indicator.ttl")
```

If validation passes and `cdi-indicator.ttl` is created, you are ready to
upload the data.

## Summary

You now have a validated, semantically uplifted JSON-LD file that describes
the Composite Drought Indicator and its provenance chain.

Next: [Section 3 – Upload and view the data](./section-3).
