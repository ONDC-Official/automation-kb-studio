# Idempotency & Retries

## Objective

Explain how to handle **duplicate callbacks and safe retries** on the ONDC network — keyed on `message_id`. Covers why duplicates happen and how to stay correct. Does NOT cover TTL (see `12-ttl-handling`) or transport security.

## Prerequisite

- The async `action` → `on_action` model (see `11`) with `message_id` / `transaction_id` correlation.

## Deliverable

Processing that produces the same result whether a callback arrives once or several times, and retries that don't create duplicate side effects.

## The rule, in one line

Treat every `on_action` as **possibly-duplicate**: make processing **idempotent, keyed on `message_id`** (within `transaction_id`), so re-delivery is harmless.

## Guideline

1. On receiving `on_action`, check whether that `message_id` has already been processed.
2. If yes, **ACK and no-op** (do not re-apply side effects).
3. If no, process, record the `message_id` as handled, then ACK.
4. When **retrying** an outbound call (e.g. no ACK received), reuse the **same `message_id`** so the receiver can dedupe.

## Protocol nuances (why this is ONDC-peculiar)

- **Callbacks can be delivered more than once** — network retries mean `on_action` may repeat; the receiver, not the sender, guarantees idempotency.
- **Dedupe key = `message_id`** (scoped to its `transaction_id`). Never dedupe on arrival time or payload equality alone.
- **Retry with the same `message_id`**, not a new one — a new id would look like a distinct request and break correlation/dedup.
- **Idempotency is a guideline layer**, not a wire field — the protocol gives you `message_id`; enforcing exactly-once effects is the implementer's responsibility.

## Sources

- ONDC developer-docs `protocol-network-extension`
- ONDC-Protocol-Specs core API contract (`protocol-specifications/core/v0/api/core.yaml`)
