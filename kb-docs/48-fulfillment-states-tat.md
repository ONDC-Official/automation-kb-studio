# Fulfillment States & TAT

## Objective

Explain **fulfillment status values** and **turnaround-time (TAT)** expectations. Does NOT cover the catalog (see `36`).

## Prerequisite

- A confirmed order with fulfillments (see `08`).

## Deliverable

Fulfillment states and TATs that are set and honoured consistently across the order.

## The idea, in one line

Each fulfillment has a **state** and a **TAT** (promised turnaround) that both sides quote and track.

## Real fulfillment states (RET11)

Delivery milestones, in order: **Pending → Packed → Agent-assigned → Order-picked-up → Out-for-delivery → Order-delivered** (terminal); **Cancelled** (terminal). The BPP rebuilds the state array at each milestone (persisted as `on_status_fulfillments`) so each `on_status` push carries the current state. TAT is quoted via **`@ondc/org/TAT`** (fulfillment) and **`@ondc/org/time_to_ship`** (item), both ISO8601 durations.

## Guideline

1. Quote **TAT** on the catalog/quote (ISO8601 duration).
2. Advance `fulfillment.state` along the allowed values; report via `on_status` (see `21`).
3. A TAT that changes from what was quoted is an error (e.g. invalid-TAT codes — see `15`).

## Protocol nuances (why this is ONDC-peculiar)

- **TAT is a promised duration**, quoted upfront and enforced — a mismatch raises invalid-TAT errors (`60008`/`62506`, see `15`).
- **Fulfillment state ≠ order state** — they advance semi-independently (see `44`).
- **State drives logistics linkage** (see `49`) and settlement timing.

## Sources

- ONDC-RET-Specifications; ONDC-LOG-Specifications
- ONDC automation-specifications `config/errors/index.yaml` (branch `draft-RET11-1.2.5`)
