---
sidebar_position: 5
title: "Exercise 4: Profiling a block and writing unit tests"
slug: /ogc-blocks-core-capabilities/exercise-4
---

# Exercise 4: Profiling a block and writing unit tests

*Profiling* means creating a new block that extends an existing one with
additional constraints, without modifying the original. The new block inherits
the parent's schema, context, and SHACL rules, and then adds its own on top.
This is how standards evolve in practice: a base specification defines a common
model; profiles of that specification add domain-specific or application-specific
restrictions.

This exercise also introduces *negative test cases* — examples that are
deliberately invalid. A file in `tests/` whose name ends in `-fail` is treated
as a negative test: it is expected to fail validation, and the report marks it
as passed when it does. Files in `examples/` are always treated as positive
examples (expected to pass), even if their name includes `-fail`. Moving the
invalid examples to `tests/` with the `-fail` suffix is therefore what enables
them to function as confirmed negative tests. The test suite then covers both
"this valid document should pass" and "this invalid document should fail."

## Step 1: Create the exercise files

Create the directory `_sources/exercise4/` with the following structure:

```
_sources/exercise4/
├── bblock.json
├── schema.yaml
├── rules.shacl
├── examples.yaml
├── examples/
│   ├── example.json
│   ├── example_b_lt_5-fail.json
│   └── example_b_lt_c-fail.json
└── tests/
    (empty for now)
```

**`bblock.json`**:

```json
{
  "name": "Exercise 4: Profiling a block and writing unit tests",
  "abstract": "Profiling Exercise 3 with an additional rule and testing with negative examples.",
  "itemClass": "schema",
  "status": "under-development",
  "dateTimeAddition": "2024-01-01T00:00:00Z",
  "version": "0.1",
  "dateOfLastChange": "2024-01-01"
}
```

**`schema.yaml`** — just the JSON Schema declaration, with no parent block
reference yet:

```yaml
$schema: https://json-schema.org/draft/2020-12/schema
```

**`rules.shacl`** — a new constraint (`b` must be at least 5), but with no
target class declared:

```turtle
@prefix sh:          <http://www.w3.org/ns/shacl#> .
@prefix mynamespace: <http://example.org/ns1/> .
@prefix ns1:         <https://example.org/my-bb-model/> .

<#testValues>
    a              sh:NodeShape ;
    sh:message     "B must not be less than 5" ;
    sh:property    [ sh:path        ns1:b ;
                     sh:minInclusive  5 ]
.
```

**`examples.yaml`** — lists only the valid example:

```yaml
examples:
- title: Valid under both rules (b=6, c=1)
  snippets:
    - language: json
      ref: examples/example.json
```

**`examples/example.json`** — valid: `b=6` satisfies `b ≥ 5`, and `c=1 < b=6`:

```json
{
  "a": "mynamespace:aThing",
  "b": 6,
  "c": 1
}
```

**`examples/example_b_lt_5-fail.json`** — invalid: `b=4` violates `b ≥ 5`:

```json
{
  "a": "mynamespace:aThing",
  "b": 4,
  "c": 1
}
```

**`examples/example_b_lt_c-fail.json`** — invalid: `c=10 > b=6` violates the
`c < b` rule inherited from Exercise 3:

```json
{
  "a": "mynamespace:aThing",
  "b": 6,
  "c": 10
}
```

Now run the postprocessor. The build succeeds — but for the wrong reason. With
no `$ref` the block inherits nothing from Exercise 3, and with no
`sh:targetClass` the new rule is never applied. The `-fail` examples in
`examples/` pass validation because there are no active rules to fail them
against. The validation banner shows green, but the validation report tells the fuller
story: the SHACL shape is listed with no targeted nodes — the block is not
actually verifying anything useful.

## Step 2: Apply all three fixes and rebuild

Three changes are needed. Apply them in order — after the first two, the
validation report will show failures for the `-fail` examples sitting in
`examples/` (because the rules are now active and do reject them). The third
fix moves them to `tests/` so they are correctly classified as expected
failures rather than unwanted errors:

### Fix 1 — Add `$ref` to `schema.yaml`

```yaml
$schema: https://json-schema.org/draft/2020-12/schema
$ref: bblocks://ogc.bblocks.tutorial.exercise3
```

This makes Exercise 4 a profile of Exercise 3. All of Exercise 3's schema
constraints, JSON-LD context, and SHACL rules are now inherited.

### Fix 2 — Add `sh:targetClass` to `rules.shacl`

```turtle
<#testValues>
    a              sh:NodeShape ;
    sh:targetClass mynamespace:aThing ;
    sh:message     "B must not be less than 5" ;
    sh:property    [ sh:path        ns1:b ;
                     sh:minInclusive  5 ]
.
```

### Fix 3 — Move the `-fail` examples to `tests/`

```bash
mv _sources/exercise4/examples/example_b_lt_5-fail.json _sources/exercise4/tests/
mv _sources/exercise4/examples/example_b_lt_c-fail.json _sources/exercise4/tests/
```

After this move, `examples/` contains only the valid example, and `tests/`
contains the two examples that must fail.

### Rebuild and inspect

Rerun the postprocessor. Navigate to the **Exercise 4** block and open the
**Examples** tab. You should see:

- `example.json` — passes (b=6, satisfies both b ≥ 5 and c < b).
- `example_b_lt_5-fail.json` — listed as a negative test, expected to fail;
  it does fail (b=4 < 5), so the test passes.
- `example_b_lt_c-fail.json` — listed as a negative test, expected to fail;
  it does fail (c=10 > b=6), so the test passes.

The distinction is important: a *failed example* is a validation error; a
*passed negative test* is a successful verification that invalid data is
correctly rejected. The validation report shows the full SHACL picture for each
test: which shapes ran, which nodes they targeted, and the violation details for
each failed test.

## How it works

### Profiling with `$ref`

```yaml
$ref: bblocks://ogc.bblocks.tutorial.exercise3
```

The `bblocks://` URI scheme references another block by its identifier. The
postprocessor resolves this to the full schema of Exercise 3 (which it already
knows about, since it is in the same register) and inlines it as a JSON Schema
`$ref`. Inheritance includes everything: the schema, any `context.jsonld`,
and any `rules.shacl`.

Your new block's own schema, context, and rules are then layered on top. The
result is a block that enforces all of Exercise 3's constraints plus the new
`b ≥ 5` constraint.

### `examples/` vs `tests/`, and the `-fail` suffix

| File | Expectation | Report shows "passed" when |
|---|---|---|
| `examples/*.json` | Must pass validation | Validation passes |
| `tests/*-fail.json` | Must fail validation | Validation fails |
| `tests/*.json` (no `-fail`) | Must pass validation | Validation passes |

The postprocessor discovers files in both directories automatically. In `tests/`,
the `-fail` suffix on the filename is what marks a file as a negative test case.
Files in `tests/` without that suffix are treated as positive tests — they must
pass, but they are not shown in the block's public documentation. Files in
`examples/` are always positive tests, regardless of their name.

### Why negative tests matter

Negative tests are the only reliable way to verify that your validation rules
are working. Without them, you cannot tell whether a rule is being silently
skipped (because, for example, `sh:targetClass` is commented out and the shape
is never applied) or genuinely passing.

---

Next: [Exercise 5 — Packaging semantics in a GeoJSON Feature](./section-5.md).
