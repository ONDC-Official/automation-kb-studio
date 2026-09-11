# search / on_search (Protocol Lens)

## Objective

Explain **what `search` is, how it is routed, and what `on_search` carries** — from a protocol lens (routing, handshake, correlation), not a field-by-field payload spec. `search` is the network's discovery action and the **only** gateway-routed action. Does NOT cover catalog modelling detail or order actions (`select` onward, see P2P).

## Prerequisite

- Registered BAP with a valid `Authorization` signature.
- A `context` with `domain`, `city`, `action: search`, `bap_id`/`bap_uri`, `transaction_id`, `message_id`, `timestamp`, `ttl`.

## Deliverable

A discovery round trip: one signed `search` fanned out by the gateway → multiple `on_search` catalog responses accumulated by the BAP.

## The action, in one line

`search` = the BAP's **discovery intent**, broadcast by the Beckn Gateway to all relevant BPPs; each BPP answers with its catalog in `on_search`.

## Guideline (the round trip)

1. **BAP signs** `search` and sends it **to the gateway** (not to a BPP).
2. **Gateway verifies + re-signs + fans out** to relevant BPPs by `domain` + `city` (see `05-gateway-interaction`).
3. Each **BPP returns a synchronous ACK/NACK**, then sends its **`on_search`** (catalog) **directly to `bap_uri`** — not back through the gateway.
4. **BAP accumulates** `on_search` responses over the `ttl` window (fan-in from many BPPs).

## Protocol nuances (why this is ONDC-peculiar)

- **Only gateway-routed action.** Everything from `select` onward is peer-to-peer.
- **Asymmetric routing.** `search` goes *through* the BG; `on_search` comes back *direct* to the BAP. The gateway does not route callbacks.
- **Many-to-one callback.** One `search` → many `on_search`; the BAP correlates by `transaction_id`/`message_id` and stops accumulating at `ttl` expiry.
- **`on_search` after `ttl` is invalid** and should be ignored.

## Payload (high level — verify against RET contract before asserting)

- `search.message.intent` expresses what the buyer wants (item/category/fulfillment/location filters).
- `on_search.message.catalog` returns providers, items, categories, fulfillments.

## Sources

- ONDC developer-docs `protocol-network-extension`
- ONDC-RET-Specifications; ONDC-Protocol-Specs core API contract (`protocol-specifications/core/v0/api/core.yaml`)
