# Payment Terms (Collector, Prepaid / COD)

## Objective

Explain **who collects payment** (BAP vs BPP) and prepaid/COD handling. Does NOT cover settlement/reconciliation (out of scope).

## Prerequisite

- An `init` → `on_init` establishing payment terms (see `20`).

## Deliverable

A `payment` block that states the collector, type and status unambiguously for both sides.

## The idea, in one line

The `payment` object declares the **collector** (BAP-collected or BPP-collected), the **type** (prepaid / on-fulfillment / COD), and status — set during `init`/`on_init` and carried into `confirm`.

## Guideline

1. In `init`/`on_init`, agree the **collector** and terms via: `payment.collected_by` (BAP | BPP), `payment.type`, `payment.status` (**Pending → Paid**), `@ondc/org/collection_amount`, and the finder-fee tags **`@ondc/org/buyer_app_finder_fee_type`** + **`@ondc/org/buyer_app_finder_fee_amount`**.
2. Set the payment **type** (prepaid, COD/on-fulfillment).
3. Carry the agreed terms into `confirm`; they establish the settlement basis (collector + finder fee).

## Protocol nuances (why this is ONDC-peculiar)

- **Collector can be either side.** BAP-collected vs BPP-collected changes the money flow and the settlement responsibility.
- **COD vs prepaid changes the fulfillment/settlement path.**
- **Payment terms establish the settlement basis** — collector + finder fee determine who owes whom.

## Sources

- ONDC-RET-Specifications; ONDC-Protocol-Specs core API contract
- ONDC automation-specifications `config/attributes` (branch `draft-RET11-1.2.5`)
