# track / on_track (Protocol Lens)

## Objective

Explain **`track` / `on_track`** from a protocol lens — requesting a tracking URL or coordinates — covering routing, handshake and correlation. Does NOT cover order-state semantics (see `21-status-on_status`).

## Prerequisite

- A confirmed order (see `08`) with a trackable fulfillment.

## Deliverable

A tracking reference (URL or coordinates) returned to the buyer.

## The action, in one line

`track` = the BAP's **tracking request** for a fulfillment; `on_track` = the BPP's **tracking URL / coordinates**. **Peer-to-peer** — no gateway.

## Guideline (the round trip)

1. **BAP signs** `track` (order/fulfillment reference) and POSTs **directly to `bpp_uri`**.
2. **BPP verifies**, returns synchronous **ACK/NACK**.
3. **BPP sends** async **`on_track`** (tracking URL/coordinates) **directly to `bap_uri`**, signed.
4. Correlate by `message_id` within the `transaction_id`.

## Protocol nuances (why this is ONDC-peculiar)

- **Tracking, not state.** `on_track` returns *where* (URL/coordinates); order/fulfillment *state* is `status` (see `21`).
- **Availability varies.** Not every fulfillment type supports live tracking; the BPP may return a URL rather than coordinates.
- **Peer-to-peer, one header**; `transaction_id` continues.

## Sources

- ONDC-RET-Specifications; ONDC-LOG-Specifications; ONDC-Protocol-Specs core API contract
- ONDC developer-docs `protocol-network-extension`
