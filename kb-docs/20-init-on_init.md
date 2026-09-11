# init / on_init (Protocol Lens)

## Objective

Explain **`init` / `on_init`** from a protocol lens — draft order with billing/shipping and payment terms — covering routing, handshake and correlation, not a field-by-field payload spec. Does NOT cover the quote (`19`) or final placement (`08`).

## Prerequisite

- A completed `select` → `on_select` (an agreed quote).

## Deliverable

A draft order: billing/shipping submitted, payment terms and a firm quote returned in `on_init`.

## The action, in one line

`init` = the BAP's **draft order** (billing + shipping + selected quote); `on_init` = the BPP's **draft confirmation** with payment terms. **Peer-to-peer** — no gateway.

## Guideline (the round trip)

1. **BAP signs** `init` and POSTs it **directly to `bpp_uri`**.
2. **BPP verifies**, returns synchronous **ACK/NACK**.
3. **BPP sends** async **`on_init`** (draft order + payment terms) **directly to `bap_uri`**, signed.
4. **BAP verifies** and correlates by `message_id` within the `transaction_id`.

## Protocol nuances (why this is ONDC-peculiar)

- **Still not placed.** `init` establishes billing/shipping and payment terms; the order is created only at `confirm`.
- **Payment terms surface here** — who collects (BAP vs BPP), prepaid/COD — carried into `confirm`.
- **Peer-to-peer, one header**; `transaction_id` continues, `message_id` pairs `init`/`on_init`.

## Sources

- ONDC-RET-Specifications; ONDC-Protocol-Specs core API contract (`protocol-specifications/core/v0/api/core.yaml`)
- ONDC developer-docs `protocol-network-extension`
