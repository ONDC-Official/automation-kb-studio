# message_id

## Objective

Explain **`message_id`** uniqueness per request and how it matches a request to its callback. Does NOT cover `transaction_id` (see `34`).

## Prerequisite

- A `context` block on every message.

## Deliverable

A `message_id` scheme that lets each `action` be correlated to its `on_action`.

## The rule, in one line

`message_id` is **unique per request**, and a request and its `on_` callback **share the same `message_id`** — that's how `on_select` is matched to its `select`.

## Guideline

1. Generate a new `message_id` (UUID) for each **new** `action` request.
2. The receiver echoes the **same** `message_id` in the corresponding `on_action`.
3. Correlate request↔callback by `message_id`; dedupe repeated callbacks by it (see `13`).

## Protocol nuances (why this is ONDC-peculiar)

- **Pair key, not journey key.** `message_id` pairs one request with its callback; `transaction_id` spans the whole order (see `34`).
- **Shared across the pair** — the callback deliberately reuses the request's `message_id`, unlike a fresh request which gets a new one.
- **Reuse it on retries** of the same request (see `13`) so the receiver can dedupe; a new id would look like a new request.

## Sources

- ONDC developer-docs `protocol-network-extension`
- ONDC-Protocol-Specs core API contract (context object)
