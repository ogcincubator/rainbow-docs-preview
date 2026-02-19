---
sidebar_position: 1
title: Introduction
---

# Applied OGC RAINBOW: Creating and publishing an indicator definition

In this tutorial we will use OGC RAINBOW to create and publish a formal
definition of a **computed indicator** — one that is derived from three
distinct observable properties — and make it accessible as linked data.

## The scenario

We will define and publish a **Composite Drought Indicator (CDI)**, a
well-established index used in drought monitoring and early-warning systems.
The CDI is relevant to multiple Sustainable Development Goals:

- **SDG 2** – Zero Hunger (food-security implications of drought)
- **SDG 13** – Climate Action (drought as a climate impact)
- **SDG 15** – Life on Land (vegetation and ecosystem stress)

The CDI is computed from three observable properties measured at a monitoring
station:

| Observable property | Description |
|---|---|
| Soil Moisture Anomaly (SMA) | Deviation of soil moisture from the long-term mean |
| Rainfall Anomaly (RA) | Deviation of precipitation from the climatological normal |
| Vegetation Condition Anomaly (VCA) | NDVI-derived measure of vegetation stress |

A single **computation activity** takes these three observations as inputs and
produces the CDI value as output. We will capture this dependency as a
*provenance chain* using an OGC Building Block, validate it, and then upload
and publish the result using a locally deployed OGC Definitions Service.

## What you will learn

- How to deploy the OGC Definitions Service using Docker
- How to describe a computed indicator as a provenance chain with OGC Building Blocks
- How to validate and semantically uplift a JSON document using `bblocks-client-python`
- How to upload data to Apache Fuseki and browse it via the Prez interface

## Prerequisites

- A working **Docker** environment with the `docker compose` plugin
- A working **Python 3** environment (3.9 or later recommended)

## How this tutorial is organized

| Section | What it covers |
|---|---|
| [Section 1: Deploy the OGC Definitions Service](./section-1) | Setting up Fuseki, Prez, and nginx-ld locally with Docker |
| [Section 2: Define the indicator](./section-2) | Writing and validating the provenance chain for the CDI |
| [Section 3: Upload and view the data](./section-3) | Loading data into Fuseki and browsing it as linked data |

Ready? Continue to [Section 1](./section-1).
