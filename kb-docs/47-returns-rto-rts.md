# Returns, RTO & RTS

## Objective

Explain **return / replacement**, **return-to-origin (RTO)** and **ready-to-ship (RTS)** flows. Does NOT cover forward fulfillment (see `48`).

## Prerequisite

- A confirmed/fulfilled order (see `08`); returns carry a reason code (see `17`).

## Deliverable

Correctly modelled return / RTO / RTS transitions via `update` and fulfillment state.

## The idea, in one line

**Return** = buyer sends items back (via `update`, with a reason); **RTO** = undelivered shipment returns to the seller/origin; **RTS** = an order is packed and ready to ship — each is a fulfillment-state path.

## Guideline

1. **Return** — buyer initiates via `update` with a return reason; a return fulfillment tracks it (see `23`).
2. **RTO** — when delivery fails, the fulfillment moves to a return-to-origin path.
3. **RTS** — the seller marks the order ready-to-ship before handover to logistics.

## Real structure (RET11 flows)

- **RTO / partial cancel append a separate `Cancel`-type fulfillment leg** to the fulfillments array (the original delivery leg's state is overwritten from session data). The `RTO_PLUS_PART_CANCELLATION` flow correlates the cancelled leg with its resulting RTO leg via fulfillment `state` tags (RTO reference, cancellation reason code, logistics partner id).
- **RTS** is a fulfillment state ahead of handover; **returns** run through `update` with a return reason (see `17`).

## Protocol nuances (why this is ONDC-peculiar)

- **Returns go through `update`, not `cancel`** — cancellation ends an order; a return amends a delivered one (see `22` vs `23`).
- **RTO is a fulfillment path**, driven by delivery failure, distinct from a buyer return — modelled as an appended `Cancel`-type leg, not a state flip on the delivery leg.
- **Reason codes apply to returns** (see `17`) and feed settlement.

## Sources

- ONDC-RET-Specifications
- ONDC automation-specifications `config/flows/F&B/RETURN_FLOW.yaml`, `RTO_PLUS_PART_CANCELLATION.yaml` (branch `draft-RET11-1.2.5`)
