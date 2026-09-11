# Schema Validation Tool — Usage

## Objective

Explain using the Workbench **Schema Validation** tool to check a single payload. Does NOT cover end-to-end flow testing (see `61`) or cross-field validations (see `16`).

## Prerequisite

- A payload and its `domain` + `core_version`.

## Deliverable

A payload validated against the domain/version JSON schema, with errors localized and resolved.

## What it checks

Paste/upload a payload, pick **domain + version**, and the tool validates **schema correctness, data types, required fields, and enums**, reporting each error in a panel below the editor.

## Guideline (the 7 steps, from the UI)

1. Confirm the tool supports your **domain** (a domain list is shown).
2. **Paste / upload** your API JSON payload (e.g. a `search` payload).
3. Set **domain + version compliance** (the version, e.g. ONDC v2.0.2).
4. Click **Validate** to check for errors.
5. **Review** the validation errors in the panel below the editor.
6. **Resolve** errors and validate again.
7. Get the **successful validation** message.

## CLI form

The same check runs as a CLI, e.g.:

```
workbench validate --domain ONDC:RET11 --action search
// parsing payload against ONDC v2.0.2 schema...
✓ context.domain     valid
✓ context.action     valid
✓ context.bap_id     resolved
! message.intent.fulfillment  missing gps
```

## Protocol nuances (why this is ONDC-peculiar)

- **Single-payload, not flow.** It validates one message in isolation (structure/type/enum); sequencing and cross-field `x-validations` are the scenario suite's job (see `61`, `16`).
- **Domain + version selection matters** — validating against the wrong version yields false errors (see `14`).
- **Errors are field-localized** — each error points at the JSON path (e.g. `message.intent.fulfillment missing gps`), matching the `attr` targets in the validation config (see `16`, `65`).

## Sources

- ONDC `automation-framework` (Core Tools — Schema Validation)
- Workbench UI (Schema Validation) — `workbench.ondc.tech`
