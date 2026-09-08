# status / on_status (Protocol Lens)

## Objective

Explain **`status` / `on_status`** from a protocol lens — polling or pushing order & fulfillment state — covering routing, handshake and correlation. Does NOT cover tracking coordinates (see `24-track-on_track`).

## Prerequisite

- A confirmed order (see `08`) with an order id.

## Deliverable

Current order/fulfillment state returned to the buyer.

## The action, in one line

`status` = the BAP's **state query** for a confirmed order; `on_status` = the BPP's **current order + fulfillment state**. **Peer-to-peer** — no gateway.

## Guideline (the round trip)

1. **BAP signs** `status` (referencing the order id) and POSTs it **directly to `bpp_uri`**.
2. **BPP verifies**, returns synchronous **ACK/NACK**.
3. **BPP sends** async **`on_status`** (order + fulfillment state) **directly to `bap_uri`**, signed.
4. **BAP** correlates by `message_id` within the `transaction_id`.

## Protocol nuances (why this is ONDC-peculiar)

- **Two shapes: pull and push.** The BAP can request `status`, and the BPP can also send an **unsolicited `on_status`** when state changes.
- **State, not location.** `on_status` reports order/fulfillment *state*; live location is `track` (see `24`).
- **Peer-to-peer, one header**; `transaction_id` continues.

## Sources

- ONDC-RET-Specifications; ONDC-Protocol-Specs core API contract (`protocol-specifications/core/v0/api/core.yaml`)
- ONDC developer-docs `protocol-network-extension`
