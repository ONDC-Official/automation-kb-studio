# Interpreting Validation Error Reports

## Objective

Explain reading the Workbench **error report** and triaging fixes. Does NOT list every error code (see `15`).

## Prerequisite

- A Workbench schema/scenario run that produced errors (see `60`, `61`).

## Deliverable

A triaged list of fixes from an error report.

## The report shape

Validation is driven by **JVAL** (the `automation-validation-compiler`), which compiles the `x-validations` config (see `16`) into executable validators. Each check returns:

```
[ { code: <number>, valid: <boolean>, description: <string> }, … ]
```

So every error in the report carries a **`code`**, a **`valid` flag**, and a **`description`** — plus the JSON path of the offending field (e.g. `message.intent.fulfillment missing gps`).

## Guideline

1. For each failing entry, read the **`description`** and the **JSON path** to find the offending field.
2. Compare expected vs actual to see what's wrong (missing, wrong type, bad enum, failed condition).
3. Classify: schema/type → structural fix; enum → wrong code; conditional `x-validation` (JVAL operators like `are present`, `all in`, `follow regex`) → cross-field fix (see `16`).
4. Map the `code` to the error registry if it's a protocol error (see `15`).
5. Re-run until every entry is `valid: true`.

## Protocol nuances (why this is ONDC-peculiar)

- **Path + description + code is the triage key** — every error localizes to a JSONPath matching the `attr` targets in `validations/index.yaml` (see `16`).
- **Two error classes** — structural schema errors vs conditional `x-validation` failures; fixed differently.
- **The engine is code-generated** — JVAL turns YAML/JSON validation configs into TypeScript validators (`comp.generateCode(x_validations, "L1-validations")`), so report entries map 1:1 to config tests.

## Sources

- ONDC `automation-validation-compiler` (JVAL — validation code generator)
- ONDC `automation-framework` (Workbench reports); automation-specifications `config/validations/index.yaml`
