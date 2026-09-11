# rating / support (Protocol Lens)

## Objective

Explain **`rating` / `on_rating`** and **`support` / `on_support`** from a protocol lens — post-fulfillment feedback and support-contact exchange — covering routing and handshake. Does NOT cover formal disputes (IGM issue/grievance).

## Prerequisite

- A confirmed / fulfilled order (see `08`).

## Deliverable

A submitted rating (acknowledged) and/or support contact details returned to the buyer.

## The actions, in one line

`rating` = the BAP submits **feedback** (rating value + category); `support` = the BAP requests **support-contact details**; each has an `on_` callback. **Peer-to-peer** — no gateway.

## Guideline (each round trip)

1. **BAP signs** `rating` / `support` and POSTs **directly to `bpp_uri`**.
2. **BPP verifies**, returns synchronous **ACK/NACK**.
3. **BPP sends** async **`on_rating`** (ack / feedback form) or **`on_support`** (contact details) **directly to `bap_uri`**, signed.
4. Correlate by `message_id` within the `transaction_id`.

## Protocol nuances (why this is ONDC-peculiar)

- **Feedback / help, not disputes.** `rating` and `support` are lightweight; a formal complaint is Issue & Grievance Management (IGM), a separate flow.
- **`on_rating` may return a form** — some implementations respond with a rating form/category rather than a bare ack.
- **Peer-to-peer, one header**; `transaction_id` continues.

## Sources

- ONDC-RET-Specifications; ONDC-Protocol-Specs core API contract (`protocol-specifications/core/v0/api/core.yaml`)
- ONDC developer-docs `protocol-network-extension`
