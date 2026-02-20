---
sidebar_position: 2
title: "Deploy the OGC Definitions Service"
slug: /applied-ogc-rainbow/1-deploy
---

# Deploy the OGC Definitions Service

Before we can publish anything, we need somewhere to store and serve the data.
In this section we deploy a local instance of the **OGC Definitions Service**
using Docker.

## A quick primer on Docker

If you haven't used Docker before, here's the short version: Docker lets you
run applications inside **containers** — lightweight, isolated environments
that bundle an application together with everything it needs to run. This means
you don't have to install or configure Fuseki, Prez, or any other component
directly on your machine; Docker handles that for you.

We'll use **Docker Compose**, a tool for defining and running multi-container
applications. You describe all the services you need in a single file
(`docker-compose.yml`), and Docker Compose takes care of starting them in the
right order with the right settings.

## Components

The OGC Definitions Service is made up of four components, each running as a
separate container:

| Component | Role |
|---|---|
| **Apache Fuseki** | A [triplestore](https://en.wikipedia.org/wiki/Triplestore) — a database designed to store RDF graph data and answer SPARQL queries. This is where all the data actually lives. |
| **Prez** (backend) | A Python service that sits in front of Fuseki. It queries the triplestore, handles content negotiation, and exposes data according to OGC API standards. |
| **Prez UI** (frontend) | A web interface (built with Nuxt) that lets human users browse the published resources in a browser. |
| **nginx-ld** *(optional)* | A reverse proxy that handles [linked data redirections](https://www.w3.org/TR/cooluris/): when a client requests a resource URI, nginx-ld redirects it to the appropriate Prez endpoint depending on the requested content type. Also useful for testing. |

These containers communicate with each other over an internal network that
Docker Compose creates automatically. From the outside, only two ports are
exposed to your machine: **3030** for the Fuseki admin interface and **8080**
for the public-facing entry point (nginx-ld).

## Creating a docker-compose.yml

Create a new directory for this tutorial and inside it create a file called
`docker-compose.yml` with the following content:

```yaml
services:

  fuseki:
    image: dockerogc/fuseki
    environment:
      # Change the admin password
      ADMIN_PASSWORD: "**CHANGE ME**"
      FUSEKI_DATASET_RAINBOW: fuseki
    # Fuseki will be available on port 3030
    ports:
      - "3030:3030"
    # The local fuseki-data directory will be used for storage
    volumes:
      - ./fuseki-data:/fuseki
    restart: unless-stopped
    healthcheck:
      test: [ "CMD", "curl", "-f", "http://localhost:3030" ]
      interval: 5s
      timeout: 10s
      retries: 3
      start_period: 20s
    logging:
      driver: "json-file"
      options:
        max-size: "50m"

  prez:
    image: dockerogc/prez
    depends_on:
      fuseki:
        condition: service_healthy
    environment:
      APP_ROOT_PATH: /prez-b
      PROXY_HEADERS: 'true'
      FORWARDED_ALLOW_IPS: '*'
      SPARQL_ENDPOINT: http://fuseki:3030/fuseki/query
      PREZ_TITLE: OGC Rainbow
      PREZ_DESC: OGC Rainbow

      # This points to the external prez-backend URL
      SYSTEM_URI: https://my.own.domain/prez-b/
      # This points to the external prez-ui URL
      PREZ_UI_URL: https://my.own.domain/prez/

      ENABLE_SPARQL_ENDPOINT: 'true'
    restart: unless-stopped

  prez-ui:
    image: ghcr.io/ogcincubator/ogc-prez-ui
    depends_on:
      prez:
        condition: service_started
    environment:
      NUXT_PUBLIC_PREZ_API_ENDPOINT: https://my.own.domain/prez-b
      NUXT_PUBLIC_APP_TITLE: OGC RAINBOW
      NUXT_APP_BASE_URL: /prez/
    restart: unless-stopped

  nginx-ld:
    image: dockerogc/nginx-ld
    depends_on:
      - prez
      - prez-ui

    # The reverse proxy will be available on port 8080
    ports:
      - "8080:80"
    environment:
      # http://localhost:8080 can be used for tests here
      EXTERNAL_PREZ_BACKEND_URL: https://my.own.domain/prez-b

      # Configure linked data redirects here. This controls how
      # requests made to the proxy will be mapped to full resource URIs
      REDIRECTS: |
        /rainbow/=https://example.com/rainbow/
```

Let's walk through the key parts:

**Fuseki** stores the RDF data. We give it an admin password and a dataset name
(`fuseki`). Its data is persisted in a `fuseki-data` directory on your local
machine, so it survives container restarts. The `healthcheck` block tells Docker
Compose to wait until Fuseki is actually ready before starting Prez — otherwise
Prez would try to connect before the database is up.

**Prez** connects to Fuseki via SPARQL and exposes an OGC API. It is configured
to start only after Fuseki passes its health check (`condition: service_healthy`).
Several environment variables reference `https://my.own.domain/` — we will
replace these in the next step.

**Prez UI** is the browser-facing interface. It starts as soon as the Prez
backend container has started (it does not need to wait for Prez to be fully
ready).

**nginx-ld** is the reverse proxy and public entry point. It sits in front of
both Prez and Prez UI, handles linked data content negotiation, and exposes
everything on port 8080. For local testing, `http://localhost:8080` acts as
the entry point.

## Configuration

Before starting the stack, review the following settings in `docker-compose.yml`:

**Fuseki admin password** — locate the `ADMIN_PASSWORD` environment variable
under the `fuseki` service and replace the placeholder with a password of your
choice.

**Public-facing URL** — several environment variables reference
`https://my.own.domain/`. Replace every occurrence with your actual public-facing
domain (e.g. `https://yourdomain.example.org/`). If you are running locally for
testing, use `http://localhost:8080/` instead.

**Triplestore data directory** — Fuseki's data is persisted in a `fuseki-data`
subdirectory relative to the compose file. The directory will be created
automatically on first run; make sure the path is writable.

**nginx-ld redirections** — the `REDIRECTS` variable controls how incoming
URI requests are mapped to full resource URIs. Consult the
[nginx-ld documentation](https://hub.docker.com/r/dockerogc/nginx-ld) for
the full syntax. For local testing the default mapping is sufficient.

## Deployment options

The compose file supports two main usage patterns:

- **Full stack** – all four services running together, with nginx-ld acting as
  the public entry point on port 8080. Linked data redirections are active.
- **Without nginx-ld** – Prez UI is the direct entry point. Useful when you do
  not need URI redirections (e.g. during initial data loading).

## Starting the service

From the directory containing your `docker-compose.yml`, run:

:::note macOS and Windows
Make sure Docker Desktop is running before executing the command below. You can
check by looking for the Docker icon in your menu bar (macOS) or system tray
(Windows).
:::

```bash
docker compose up -d
```

The `-d` flag runs the containers in the background (detached mode), so your
terminal is free to use while the services are running. Docker will pull the
required images on the first run, which may take a minute or two depending on
your connection.

Once all containers are healthy, the following endpoints will be available:

| Endpoint | URL |
|---|---|
| Fuseki admin UI | http://localhost:3030 |
| Prez UI | http://localhost:8080 (via nginx-ld) |

## Verifying the deployment

Open http://localhost:3030 in your browser. You should see the Apache Fuseki
administration interface. Log in with `admin` and the password you configured.

## Summary

You now have a running OGC Definitions Service with:

- A triplestore (Fuseki) ready to accept data
- A Prez backend ready to serve it
- A web UI to browse it
- An nginx-ld reverse proxy for linked data redirections

Next: [Section 2 – Define the indicator](./section-2.md).
