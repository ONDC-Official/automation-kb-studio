# Domain & Version Enablement

## Objective

Explain which **domains / use-cases** and **contract versions** are live on ONDC and how they're identified. Does NOT define item attributes (see `48-taxonomy`).

## Prerequisite

- A `context` carrying `domain` and `core_version`.

## Deliverable

Correct `domain` + `core_version` values so messages route and validate against the right enabled contract.

## The idea, in one line

Only specific **`domain` codes** (e.g. `ONDC:RET11`, `ONDC:LOG11`, `ONDC:FIS12`) and **`core_version`s** are enabled at any time; both must be set in `context` and both must be currently supported.

## Guideline

1. Set `context.domain` to an enabled domain code and `context.core_version` to a supported version.
2. Validate payloads against the schema/config for **that** domain+version (see `14`, `16`).
3. Track enablement — the live set changes as domains/versions are added or deprecated.

## Protocol nuances (why this is ONDC-peculiar)

- **Domain code drives everything downstream** — schema, validations, error codes and gateway routing are all per domain+version.
- **Version matters for validation** — the automation-specifications config lives on per-domain-version branches (e.g. `draft-RET11-1.2.5`); use the matching one.
- **The enabled list is external** — maintained by ONDC (Enabled Domains sheet), not derivable from the payload.

## Sources

- ONDC developer-docs (enabled domains / versions)
- ONDC automation-specifications (per-domain-version branches)
