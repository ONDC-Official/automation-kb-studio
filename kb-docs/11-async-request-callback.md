# Async Request → Callback Pattern

## Objective

Explain ONDC's **asynchronous `action` → `on_action` model** and how a request is correlated to its callback. This is the backbone of every ONDC interaction. Does NOT cover the synchronous ACK/NACK (see `10-ack-nack`) or TTL bounds (see `12-ttl-handling`).

## Prerequisite

- Both NPs registered; `context.bap_uri` / `context.bpp_uri` known.
- A `context` carrying `transaction_id`, `message_id`, `timestamp`, `ttl`.

## Deliverable

A non-blocking exchange: sender fires `action`, gets an immediate ACK, and later receives the result in a separate `on_action` call.

## The pattern, in one line

Every ONDC action is **asynchronous**: the sender POSTs `action`, receives a synchronous **ACK**, and the receiver later POSTs **`on_action`** back to the sender's callback URI as a **separate signed request**.

## Guideline

1. Sender signs and POSTs `action` (e.g. `select`) to the counterparty.
2. Receiver returns synchronous **ACK** (see `10`), then processes.
3. Receiver signs and POSTs **`on_action`** (e.g. `on_select`) to the sender's callback URI (`bap_uri` / `bpp_uri`).
4. Sender verifies the callback and correlates it to the original request.

## Correlation (how request and callback are matched)

- **`message_id`** — a request and its `on_` callback **share the same `message_id`**. This is how the sender matches `on_select` to its `select`.
- **`transaction_id`** — constant across the **whole order journey** (search → … → confirm → post-order), so all messages of one order are groupable.

## Protocol nuances (why this is ONDC-peculiar)

- **The callback is itself a signed request**, not an HTTP response body. `on_action` is a fresh POST to the caller's URI, verified like any inbound request.
- **Don't block on the callback.** The sender returns after the ACK and handles `on_action` when it arrives (which may be seconds later).
- **Correlate by `message_id`, group by `transaction_id`.** Never assume ordering by arrival time.
- **A callback can arrive more than once** — see idempotency (`13-idempotency-retries`).

## Sources

- ONDC developer-docs `protocol-network-extension`
- ONDC-Protocol-Specs core API contract (`protocol-specifications/core/v0/api/core.yaml`)
