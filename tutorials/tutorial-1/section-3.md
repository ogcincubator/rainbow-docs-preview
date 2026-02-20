---
sidebar_position: 4
title: "Upload and view the data"
slug: /applied-ogc-rainbow/3-upload-and-view
---

# Upload and view the data

With the OGC Definitions Service running and the uplifted Turtle file in
hand, we can now load the data into the triplestore and browse it as linked
data.

## About named graphs

Fuseki stores RDF data in **named graphs** — separate, named partitions of the
triplestore, each identified by a URI. Keeping each dataset in its own named
graph makes it easy to update or remove it later without affecting other data,
and allows SPARQL queries to target a specific subset of the data.

We will use the graph URI `https://example.com/rainbow/graphs/indicators` for
this tutorial. You can choose any URI; the convention is to use one that
reflects the content.

## Uploading the data

We cover three direct ways to upload the file, plus a mention of higher-level
OGC tooling. Option A (the Fuseki UI) is the easiest way to get started;
Options B and C are more suitable for scripting or automation.

### Option A: Fuseki admin interface

1. Open http://localhost:3030 and log in.
2. Select your dataset (e.g. `fuseki`) from the list.
3. Click **add data**.

   ![Fuseki "add data" button](./assets/fuseki-add-data.png)

4. In the **Destination graph name** field, enter:
   `https://example.com/rainbow/graphs/indicators`
5. Upload `cdi-indicator.ttl`.
6. Click **upload now**.

   ![Fuseki upload dialog](./assets/fuseki-upload-data.png)

### Option B: curl

```bash
curl -X PUT \
  -u admin:${FUSEKI_PASSWORD} \
  -H "Content-Type: text/turtle" \
  --data-binary @cdi-indicator.ttl \
  "http://localhost:3030/fuseki/data?graph=https://example.com/rainbow/graphs/indicators"
```

Set `FUSEKI_PASSWORD` to the value you configured in `docker-compose.yml`, or
replace `${FUSEKI_PASSWORD}` with the password directly.

Note that this uses `PUT`, which **replaces** the entire named graph with the
uploaded content. If you want to add triples to an existing graph instead of
replacing it, use `POST`.

### Option C: Python (requests + SPARQL Graph Store Protocol)

```python
import os
import requests

FUSEKI_URL = "http://localhost:3030"
DATASET = "fuseki"
GRAPH_URI = "https://example.com/rainbow/graphs/indicators"
FUSEKI_PASSWORD = os.environ.get("FUSEKI_PASSWORD", "changeme")

with open("cdi-indicator.ttl") as f:
    data = f.read()

response = requests.put(
    f"{FUSEKI_URL}/{DATASET}/data",
    params={"graph": GRAPH_URI},
    headers={"Content-Type": "text/turtle"},
    data=data,
    auth=("admin", FUSEKI_PASSWORD),
)
response.raise_for_status()
print(f"Uploaded successfully (HTTP {response.status_code})")
```

### Option D: OGC Naming Authority tools

The OGC Naming Authority provides higher-level tooling that automates
publishing and registration of definitions. This approach will be covered in
a dedicated tutorial.

## Browsing the resource

Once the data is loaded, you can browse it in the Prez UI. To understand how
the URL is constructed, let's trace it from the source:

1. The indicator's `id` in the JSON document is `indicators/cdi/station-alpha/2024-07`.
2. During semantic uplift, `base_uri` (`https://example.com/rainbow/`) is prepended,
   giving the full resource URI:
   ```
   https://example.com/rainbow/indicators/cdi/station-alpha/2024-07
   ```
3. The nginx-ld `REDIRECTS` mapping (`/rainbow/=https://example.com/rainbow/`)
   means any request to `http://localhost:8080/rainbow/...` is treated as a
   request for the corresponding `https://example.com/rainbow/...` URI. So the
   resource is locally accessible at:
   ```
   http://localhost:8080/rainbow/indicators/cdi/station-alpha/2024-07
   ```

:::warning Local testing configuration
If you are testing locally and did not replace the `https://my.own.domain/`
references in `docker-compose.yml` with `http://localhost:8080/`, navigating
to the resource URL or following a linked data redirect will send your browser
to `https://my.own.domain/[...]` instead of your local instance. Make sure
the `SYSTEM_URI`, `PREZ_UI_URL`, and `EXTERNAL_PREZ_BACKEND_URL` environment
variables are all set to `http://localhost:8080/` before proceeding.
:::

Navigate to that URL to see the Prez UI rendering of the resource.

<!-- TODO: add screenshot of the Prez UI result -->

## Retrieving the linked data representation

You can also retrieve the RDF representation directly using `curl`. The `-L`
flag is necessary because nginx-ld implements the linked data pattern: it
inspects the `Accept` header and responds with an HTTP 303 redirect to the
appropriate Prez endpoint. Without `-L`, curl would stop at the redirect and
return nothing useful.

```bash
curl -L \
  -H "Accept: text/turtle" \
  "http://localhost:8080/rainbow/indicators/cdi/station-alpha/2024-07"
```

Prez will return the resource serialized as Turtle RDF.

## Summary

You have successfully:

1. Deployed the OGC Definitions Service locally
2. Described the Composite Drought Indicator as a provenance chain
3. Validated and uplifted the document with `bblocks-client-python`
4. Uploaded the data to Fuseki and browsed it as linked data

The indicator is now published and accessible as a dereferenceable linked data
resource.
