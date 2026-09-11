# confirm / on_confirm (Protocol Lens)

## Objective

Explain **what `confirm` is, how it is routed, and what `on_confirm` carries** — from a protocol lens (peer-to-peer routing, handshake, correlation), not a field-by-field payload spec. `confirm` places the order. Does NOT cover discovery (`search`, see `07`) or post-order actions (`status`, `update`, `cancel`).

## Prerequisite

- A completed `select` → `init` sequence (cart + quote + billing/payment terms established).
- Registered BAP and BPP that can resolve each other's keys and URIs.

## Deliverable

A placed order: a signed `confirm` from BAP → BPP, answered by `on_confirm` carrying the confirmed order object.

## The action, in one line

`confirm` = the BAP's **order placement**; `on_confirm` = the BPP's **confirmed order** (order id, final state, agreed terms). It is **peer-to-peer** — no gateway.

## Guideline (the round trip)

1. **BAP signs** `confirm` and POSTs it **directly to `bpp_uri`** (peer-to-peer; single `Authorization` header).
2. **BPP verifies** the `Authorization`, returns a synchronous **ACK/NACK**.
3. **BPP sends** the async **`on_confirm`** (confirmed order) **directly to `bap_uri`**, itself signed.
4. **BAP verifies** `on_confirm` and correlates by `message_id` within the `transaction_id` journey.

## Protocol nuances (why this is ONDC-peculiar)

- **Peer-to-peer, one header.** Unlike `search`, `confirm` never touches the gateway; only the originator's `Authorization` travels.
- **The callback is a signed call too.** `on_confirm` is a signed request from BPP → `bap_uri`, verified like any inbound request.
- **`transaction_id` is constant** across the whole select → init → confirm → on_confirm journey; `message_id` pairs each request with its callback.
- **`on_confirm` after `ttl`** is invalid and should be ignored.

## Payload (high level — verify against RET contract before asserting)

- `confirm.message.order` echoes the agreed cart, quote, billing, fulfillment and payment terms from `init`.
- `on_confirm.message.order` returns the same order with a confirmed `id` and order/fulfillment `state`.

## Sources

- ONDC developer-docs `protocol-network-extension`
- ONDC-RET-Specifications; ONDC-Protocol-Specs core API contract (`protocol-specifications/core/v0/api/core.yaml`)
