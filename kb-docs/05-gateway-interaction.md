# Gateway Interaction (Beckn Gateway)

## Objective

Explain the **Beckn Gateway (BG)** — a search-multicast router — and exactly what happens to a request when it goes through the gateway (verify + re-sign + forward with two headers). Does NOT cover peer-to-peer routing (see `06-p2p-communication`) or the signature math (see `01`).

## Prerequisite

- The originator NP signs its request (`Authorization` header).
- The receiver can verify both an `Authorization` and an `X-Gateway-Authorization` header.

## Deliverable

A `search` that reaches all relevant BPPs, each able to cryptographically trust both the originating BAP and the forwarding gateway.

## The gateway, in one line

ONDC-operated **search multicast router** — it fans a BAP's `search` out to all relevant BPPs (by domain + city). It touches **only the outbound `search`**; `on_search` returns **directly** to the BAP, and everything from `select` onward is peer-to-peer.

## Guideline (gateway-forward path)

1. **BAP signs** the `search` → `Authorization` header.
2. **BG verifies** the BAP's `Authorization`.
3. **BG re-signs** the forwarded request with its own key → `X-Gateway-Authorization` header.
4. **BG forwards** to each relevant BPP, carrying **both** headers.
5. **BPP verifies both** — the BAP's `Authorization` and the BG's `X-Gateway-Authorization`.

## Protocol nuances (why this is ONDC-peculiar)

- **Two signatures on the gateway hop.** A BG-forwarded `search` carries the originator's header *and* the gateway's; the BPP verifies both independently.
- **The gateway does NOT route `on_search`.** The BPP replies **directly** to `bap_uri`, not back through the BG. The gateway is one-directional for the fan-out only.
- **The gateway stores nothing** — no catalog cache, no payment/fulfillment/grievance involvement.
- **Fan-in on the BAP side** — a single `search` can produce many `on_search` responses from different BPPs; the BAP accumulates them over the context `ttl` window.

## Sources

- ONDC developer-docs `registry/signing-verification.md`
- ONDC developer-docs `protocol-network-extension`
