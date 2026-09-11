# transaction_id

## Objective

Explain generating and preserving **`transaction_id`** across one order journey. Does NOT cover `message_id` (see `35`).

## Prerequisite

- A `context` block on every message.

## Deliverable

A single `transaction_id` that ties every message of one order journey together.

## The rule, in one line

`transaction_id` is generated once (by the BAP, at `search`) and **stays constant across the whole journey** — search → select → init → confirm → all post-order actions and callbacks.

## Guideline

1. The BAP generates a `transaction_id` (UUID) at the start of a journey (`search`).
2. Every subsequent `action` and `on_action` for that order **reuses the same** `transaction_id`.
3. Use it to group/trace all messages of one order.

## Protocol nuances (why this is ONDC-peculiar)

- **One journey = one `transaction_id`.** It does not change per step; only `message_id` changes per request/callback pair.
- **It's the grouping key** for logs, settlement and grievance — a wrong/rotated `transaction_id` breaks correlation across the order.
- **Constant across roles** — BAP, BPP and gateway all carry the same value for that journey.

## Sources

- ONDC developer-docs `protocol-network-extension`
- ONDC-Protocol-Specs core API contract (context object)
