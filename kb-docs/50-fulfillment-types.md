# Fulfillment Types

## Objective

Enumerate the **fulfillment types** and when each applies. Does NOT cover AWB handling (see `51`).

## Prerequisite

- An order with one or more fulfillments (see `36`, `48`).

## Deliverable

Each fulfillment tagged with the correct type so routing and expectations match.

## The idea, in one line

A fulfillment has a **type** — e.g. **Delivery**, **Buyer-Delivery**, **Self-Pickup** — that determines how the item reaches the buyer.

## Real values (RET11)

- The BPP declares a provider-level **`fulfillments[]`** container listing the fulfillment types it supports (asserted in `on_search` validation).
- Confirmed `type` values: **`Delivery`** (seller/network-arranged), **`Buyer-Delivery`** (buyer arranges logistics), **`Self-Pickup`**. Flow variants: `SELF_PICKUP`, `SLOTTED_DELIVERY` (carries a time slot), `MULTI_OPTION_FULFILLMENT` (multiple options offered).
- Each fulfillment carries a `tracking` flag (whether live tracking is enabled — see `24`).

## Guideline

1. Set `fulfillment.type` per the domain's allowed types.
2. Match the flow to the type — e.g. self-pickup skips delivery logistics; slotted delivery carries a time slot.
3. Reflect the type in serviceability and TAT (see `39`, `48`).

## Protocol nuances (why this is ONDC-peculiar)

- **Type drives the flow** — self-pickup vs delivery vs slotted delivery each has a distinct fulfillment path (the automation-specifications ship `SELF_PICKUP`, `SLOTTED_DELIVERY`, `MULTI_OPTION_FULFILLMENT` flows).
- **Buyer- vs seller-arranged logistics** changes who runs the logistics leg (see `49`).

## Sources

- ONDC-RET-Specifications; ONDC-LOG-Specifications
- ONDC automation-specifications `config/flows/F&B/SELF_PICKUP.yaml`, `SLOTTED_DELIVERY.yaml`, `MULTI_OPTION_FULFILLMENT_FLOW.yaml` (branch `draft-RET11-1.2.5`)
