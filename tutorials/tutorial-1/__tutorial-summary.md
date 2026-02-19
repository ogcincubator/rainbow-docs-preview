Tutorial: Applied OGC RAINBOW - Creating and publishing a definition for
an indicator (from a computation of different observable properties)

Intro:

-   Quick description of what we're going to do

    -   {please come up with a realistic indicator that is computed via a given
        activity from 3 different observable properties. if the indicator is related
        to sustainable development goals, all the better}

-   Pre-requisites:

    -   Working Docker environment

    -   Working Python environment

Steps:

1.  Deploy OGC Definitions Service instance

    -   Necessary to store and publish the data

    -   Components: Apache Fuseki (triplestore), Prez backend
        (redirection, serving data), Prez frontend (user interface for
        humans) {Explain what each of these means}

        -   Optional 4^th^ component: nginx-ld for linked data
            redirections and reverse-proxying. This can also be used for
            testing.

    -   Docker images available

        -   {docker-compose.yml available at
            <https://gist.github.com/avillar/8c3f52f5d44ea5669e0a112f0d48ef5a>
            }

            -   Fuseki admin password is configurable

            -   {describe the deployment options}

        -   Contains nginx service with configurable redirection
            mappings

            -   {Documentation at
                <https://hub.docker.com/r/dockerogc/nginx-ld> }

2.  Define the indicator using OGC Blocks

    -   Use the Provenance Chain OGC Block available at
        https://ogcincubator.github.io/bblock-prov-schema/

    -   Take a look at the schema, follow the examples

        -   User can find schema here:
            > <https://ogcincubator.github.io/bblock-prov-schema/bblock/ogc.ogc-utils.prov/json-schema>

            -   {full schema available at
                <https://ogcincubator.github.io/bblock-prov-schema/build/annotated/ogc-utils/prov/schema.yaml>
                }

        -   Examples available at
            <https://ogcincubator.github.io/bblock-prov-schema/bblock/ogc.ogc-utils.prov/examples>
            {you can find the code for a complete enough one can be
            found here
            <https://ogcincubator.github.io/bblock-prov-schema/build/tests/ogc-utils/prov/example_3_1.json>
            }

    -   Create a provenance chain to define the indicator

        -   {implement the definition of the indicator as a provenance
            chain}

    -   Use the OGC Blocks to validate & uplift the chain

        -   {Use bblocks-client-python. README available here:
            <https://github.com/ogcincubator/bblocks-client-python/raw/refs/heads/master/README.md>
            }

3.  Upload and view the data

    -   Several options:

        -   Use Fuseki admin interface

            -   Browse to fuseki admin URL and upload the data

            -   {per the docker-compose.yml setup, fuseki will be
                available at <http://localhost:3030> }

            -   Provide a graph URI to store the data into {explain what
                this means}

            -   {I'll provide screenshots}

        -   Use curl (PUT with authentication)

            -   {Leave a block code for me to fill in the details}

        -   Use Python (requests + SPARQL Graph Store Protocol)

            -   {Leave a block code for me to fill in the details}

        -   Use OGC Naming Authority tools {this will be explained in a
            different tutorial, we're just teasing it for now}

    -   Browse to the (local) URL of one of the resources

        -   {The specific URL will depend on the data example from step
            2 and on the redirections from step 1}

        -   View the result {I'll provide a screenshot}

    -   Use curl to retrieve the linked data view

        -   {GET request with Accept: text/turtle and with follow
            redirections on; URL will be same as above}
