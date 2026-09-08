# select / on_select (Protocol Lens)

## Objective

Explain **`select` / `on_select`** from a protocol lens — cart build and quote — covering routing, handshake and correlation, not a field-by-field payload spec. Does NOT cover discovery (`07`) or order draft (`20`).

## Prerequisite

- A completed `search` → `on_search` (a chosen provider + items).
- Registered BAP and BPP that can resolve each other's keys/URIs.

## Deliverable

A quote: the buyer selects items into a cart and the seller returns pricing in `on_select`.

## The action, in one line

`select` = the BAP's **cart / quote request** (chosen provider + items); `on_select` = the BPP's **quote** (price breakup, availability). It is **peer-to-peer** — no gateway.

## Guideline (the round trip)

1. **BAP signs** `select` and POSTs it **directly to `bpp_uri`** (single `Authorization` header).
2. **BPP verifies**, returns synchronous **ACK/NACK** (see `10`).
3. **BPP sends** async **`on_select`** (quote) **directly to `bap_uri`**, itself signed.
4. **BAP verifies** and correlates by `message_id` within the `transaction_id` journey.

## Protocol nuances (why this is ONDC-peculiar)

- **Peer-to-peer, one header** — like every non-`search` action, `select` never touches the gateway.
- **Quote is not an order.** `on_select` prices the cart; nothing is committed until `confirm`.
- **`transaction_id` continues** from discovery; `message_id` pairs this `select` with its `on_select`.
- **Serviceability can be rejected here** — a provider out of area can decline via NACK / an empty quote.

## Sources

- ONDC-RET-Specifications; ONDC-Protocol-Specs core API contract (`protocol-specifications/core/v0/api/core.yaml`)
- ONDC developer-docs `protocol-network-extension`
