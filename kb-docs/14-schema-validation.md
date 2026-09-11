# Schema Validation

## Objective

Explain validating a payload against the **ONDC JSON schema** for its domain + version, before sending and on receipt. Covers where the schemas live and how validation fits the flow. Does NOT cover cross-field/business rules (see `16-validation-rules`) or error codes (see `15-error-codes`).

## Prerequisite

- The message `domain` and `core_version` (from `context`) to select the right schema.
- Access to the ONDC schema for that domain/version (Workbench or the spec repos).

## Deliverable

Payloads that conform to the domain/version JSON schema before they go on the wire, and inbound payloads validated before ACK.

## The rule, in one line

Validate every payload against the **ONDC JSON schema for its `domain` + `core_version`** — sender-side before sending, receiver-side before ACK.

## Guideline

1. Pick the schema by `domain` + `core_version`.
2. Validate structure, required fields, datatypes and enums.
3. On a schema failure, **NACK** with a schema error (`JSON-SCHEMA-ERROR`); do not process.
4. Use the **ONDC Workbench** schema-validation tool during development; the schemas ship in `automation-specifications`.

## Protocol nuances (why this is ONDC-peculiar)

- **Schema is versioned per domain.** RET, LOG, FIS etc. and each `core_version` have their own schema — validating against the wrong version yields false failures.
- **Schema validation ≠ business validation.** A schema-valid payload can still fail cross-field `x-validations` (see `16`). Schema is structure/type/enum only.
- **Validate on both ends.** Sender validates to avoid a NACK; receiver validates before ACK to reject malformed input early.
- **Enums matter.** Many failures are enum mismatches (codes, states) rather than missing fields.

## Sources

- ONDC automation-specifications (JSON schemas per domain/version)
- ONDC automation-framework (Workbench schema-validation tool)
