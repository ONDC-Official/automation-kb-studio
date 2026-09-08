# TTL Handling

## Objective

Explain how **`context.ttl`** bounds the validity of a request/callback and how to treat late messages. Covers the ISO8601 duration format and the "expired callback" rule. Does NOT cover retries (see `13-idempotency-retries`).

## Prerequisite

- A `context` carrying `timestamp` (RFC3339) and `ttl` (ISO8601 duration, e.g. `PT30S`).

## Deliverable

Correct treatment of the validity window: acting on in-window messages and ignoring expired ones.

## The rule, in one line

`context.ttl` is a **validity window**; a message (especially an `on_action` callback) received **after its TTL has expired is invalid and should be ignored**.

## Guideline

1. Read `timestamp` (RFC3339) and `ttl` (ISO8601 duration) from `context`.
2. Compute expiry = `timestamp + ttl`.
3. If a message arrives after expiry, treat it as **invalid / ignore** it.
4. For `search`, the `ttl` bounds how long the BAP **accumulates `on_search`** responses — stop collecting after it lapses.

## Protocol nuances (why this is ONDC-peculiar)

- **TTL is a duration, not a timestamp** — ISO8601 (`PT30S` = 30 seconds, `PT1M` = 1 minute). Expiry is derived from `timestamp + ttl`.
- **Late `on_action` is invalid.** A callback that lands after the window is dropped, not processed — this prevents acting on stale quotes/state.
- **TTL drives the search fan-in window** — the BAP collects multiple `on_search` responses only until the `search` TTL expires.
- **TTL is protocol-level validity, not a business deadline** (e.g. not a delivery SLA).

## Sources

- ONDC developer-docs `protocol-network-extension`
- ONDC-Protocol-Specs core API contract (`protocol-specifications/core/v0/api/core.yaml`)
