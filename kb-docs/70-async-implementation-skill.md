# Async Implementation Skill

## Objective

A reusable **coding skill** for non-blocking `action` / `on_action` handlers (queues, idempotency). Does NOT define the protocol contract (see `11`, `13`).

## Prerequisite

- Understanding of the async request-callback model (see `11`) and idempotency (see `13`).

## Deliverable

An NP implementation that ACKs immediately, processes asynchronously, and handles callbacks idempotently.

## The idea, in one line

Implement each endpoint to **ACK fast, work async**: validate + ACK/NACK synchronously, enqueue the work, and emit `on_action` when done — with idempotent callback handling.

## Guideline

1. On inbound `action`: verify signature + schema, return **ACK/NACK** immediately (see `10`).
2. **Enqueue** the work; don't block the request thread.
3. Process, then sign and POST `on_action` to the caller's URI.
4. On inbound `on_action`: dedupe by `message_id` (see `13`) before applying effects.

## Protocol nuances (why this is ONDC-peculiar)

- **ACK-fast is mandatory** — the sync response is separate from the result (see `10`); slow processing must not delay the ACK.
- **Idempotency is on the receiver** — callbacks can repeat; key effects on `message_id` (see `13`).
- **Callbacks are outbound signed calls** — the worker signs and POSTs, it's not an HTTP response.

## Sources

- ONDC developer-docs `protocol-network-extension`
- Derived from Docs 10, 11, 13
