# Logistics Linkage (Retail ↔ LSP)

## Objective

Explain how a seller app procures **on-network logistics** from a Logistics Service Provider (LSP). Does NOT cover the retail catalog (see `36`).

## Prerequisite

- A confirmed retail order needing delivery (see `08`).

## Deliverable

A retail order fulfilled by an on-network LSP via a parallel logistics transaction.

## The idea, in one line

The seller app (retail BPP) acts as a **logistics BAP** and runs a **separate Beckn transaction** (its own search → confirm) against an LSP (logistics BPP) to move the shipment — two linked transactions, one shipment.

## Real structure (LOG11 — P2H2P)

- The logistics transaction carries the retail order via **`@ondc/org/linked_order`** — a persisted block with the provider location (shop name, building), item, weight and dimensions, seeded at order generation and carried through `confirm`.
- Fulfillment tags classify the linkage/constraints: **`linked_provider`**, **`linked_order`**, **`linked_order_item`**, **`special_req`** (set in the logistics `search`).
- **Payment** is staged (`advance` / `balance`) with cost types `base` / `cod` / `surge` / `rider` / `order`.
- **RTO** is quoted separately (`RTO quote`).
- Same `6xxxx` error set as retail (e.g. `60001`/`60002` pickup/dropoff serviceability — see `15`).

## Guideline

1. Retail order is confirmed (retail domain, e.g. `ONDC:RET11`).
2. The seller app runs a **logistics** transaction (domain **`ONDC:LOG11`**, P2H2P) as the logistics buyer against an LSP, passing the retail order in `@ondc/org/linked_order`.
3. Fulfillment status flows from the LSP back through the seller to the retail buyer.

## Protocol nuances (why this is ONDC-peculiar)

- **Two domains, two transactions, linked.** Retail and logistics are separate Beckn flows with their own `transaction_id`s, bridged by the seller app.
- **Role inversion** — the retail *seller* is the logistics *buyer* (BAP) in the logistics leg.
- **Logistics has its own specs** (LOG domain) — distinct schema/actions from retail.

## Sources

- ONDC-LOG-Specifications (B2C Logistics developer guide)
- ONDC-RET-Specifications
