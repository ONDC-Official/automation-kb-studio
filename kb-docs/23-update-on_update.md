# update / on_update (Protocol Lens)

## Objective

Explain **`update` / `on_update`** from a protocol lens — post-order changes such as returns, part-cancellation and fulfillment edits — covering routing, handshake and correlation. Does NOT cover full cancellation (see `22`) or initial placement (`08`).

## Prerequisite

- A confirmed order (see `08`); for returns, a valid return **reason code** (see `17`).

## Deliverable

An amended order reflecting the requested post-order change, returned in `on_update`.

## The action, in one line

`update` = a **post-order change request** (return, part-cancel, fulfillment edit); `on_update` = the **amended order**. **Peer-to-peer** — no gateway.

## Guideline (the round trip)

1. **Initiator signs** `update` (what changes + any reason code) and POSTs **directly** to the counterparty.
2. **Receiver verifies**, returns synchronous **ACK/NACK**.
3. **Receiver sends** async **`on_update`** (amended order) **directly** back, signed.
4. Correlate by `message_id` within the `transaction_id`.

## Protocol nuances (why this is ONDC-peculiar)

- **`update` is the catch-all for post-order mutation** — returns, replacements, part-cancellations, fulfillment/detail edits all flow through it.
- **Returns carry reason codes** (see `17`) and feed settlement/RTO.
- **Targeted change.** `update` specifies *what* changes on an existing order; it does not re-place the order.
- **Peer-to-peer, one header**; `transaction_id` continues.

## Sources

- ONDC-RET-Specifications (returns, RTO/RTS); ONDC-Protocol-Specs core API contract
- ONDC developer-docs `protocol-network-extension`
