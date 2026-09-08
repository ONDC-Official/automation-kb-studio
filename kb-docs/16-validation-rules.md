# Validation Rules (x-validations)

## Objective

Explain the **cross-field / conditional validations** ONDC enforces **beyond raw JSON schema** — the `x-validations`. Covers what they are and why a schema-valid payload can still fail. Does NOT cover structural schema checks (see `14-schema-validation`) or error codes (see `15`).

## Prerequisite

- A schema-valid payload (structure/type/enum already passed — see `14`).

## Deliverable

Payloads that satisfy not just the schema but the conditional/business-rule validations the network enforces.

## The idea, in one line

`x-validations` are **named, per-action rules over JSONPath-addressed fields** — including conditional ones JSON schema can't express — that a payload must satisfy beyond its schema.

## Actual structure (`config/validations/index.yaml`, RET11)

The file is a tree under `_TESTS_`, keyed by action. Each test has a `_NAME_`, targets a field by JSONPath (`attr`, e.g. `$.context.domain`), states its expectation in `_RETURN_` (e.g. "attr are present"), and can be **conditional** via `_CONTINUE_` (e.g. `(action equal to search)`). Tests nest, so a group like `CONTEXT_REQUIRED` holds child checks (`CONTEXT_REQUIRED_DOMAIN`, `_ACTION`, `_CITY`, `_BAP_ID`, …). Example:

```yaml
_TESTS_:
  search:
    - _NAME_: SEARCH_CONTEXT
      action: [search]
      _RETURN_:
        - _NAME_: CONTEXT_REQUIRED
          _RETURN_:
            - _NAME_: CONTEXT_REQUIRED_DOMAIN
              attr: $.context.domain
              _RETURN_: attr are present
            - _NAME_: CONTEXT_REQUIRED_BPP_ID
              attr: $.context.bap_id
              _CONTINUE_: (action equal to search)
              _RETURN_: attr are present
```

## Guideline

1. After schema validation, apply the action's `_TESTS_` from `validations/index.yaml`.
2. Each test asserts a JSONPath `attr` against a `_RETURN_` expectation; `_CONTINUE_` gates it on a condition.
3. Typical checks: required context/message fields, conditional-required fields, value/enum consistency, and cross-field reconciliation.
4. Failures surface via the Workbench flow tests and map to an error (see `15`).

## Protocol nuances (why this is ONDC-peculiar)

- **Schema-valid ≠ protocol-valid.** A structurally correct payload can still fail an `x-validation`. Frequent source of "but my JSON is valid" confusion.
- **Rules are conditional** — `_CONTINUE_` makes many "apply only when action/context is X".
- **JSONPath-addressed and named** — every check has a stable `_NAME_` and a precise `attr` target, so failures are pinpointable.
- **Versioned per domain** (`validations/index.yaml` on the domain branch) — validate against the matching version; enforced by the Workbench, so they gate go-live.
- **Compiled by JVAL.** The `automation-validation-compiler` (JVAL) turns these YAML/JSON `x-validations` into executable (TypeScript) validators — `comp.generateCode(x_validations, "L1-validations")` — each test becoming a function that returns `{code, valid, description}`. JVAL operators include `are present`, `all in`, `follow regex`, and boolean combinations. That output is what the Workbench error report shows (see `65`).

## Sources

- ONDC automation-specifications `config/validations/index.yaml` (branch `draft-RET11-1.2.5`)
- ONDC automation-framework (Workbench flow testing)
