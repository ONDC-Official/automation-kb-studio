# AWB & Shipping Label Handling

## Objective

Explain exchanging **AWB numbers** and **shipping labels** between NPs. Does NOT cover rate cards.

## Prerequisite

- A logistics fulfillment in progress (see `49`).

## Deliverable

AWB and shipping-label data exchanged so the shipment can be handed over and tracked.

## The idea, in one line

For shipped fulfillments, the LSP provides an **AWB (Air Waybill) number** and a **shipping label** which the seller prints/affixes — exchanged via fulfillment tags/documents in the logistics flow.

## Real fields (LOG11)

- **`@ondc/org/awb_no`** — the AWB (Air Waybill) number, a string (e.g. `"1227262193237777"`).
- **`shipping_label`** — a fulfillment tag: `code: shipping_label`, `value: <PDF URL>` (e.g. `https://shipping_label.com/pdf/url`) — the printable label.
- Exchanged in the logistics flow (e.g. the `E-WAY_BILL` / `E-POD` flows).

## Guideline

1. On logistics confirm/update, the LSP returns **`@ondc/org/awb_no`** and the **`shipping_label`** tag (PDF URL).
2. The seller retrieves and affixes the label before handover.
3. The AWB is used for tracking and reconciliation across the shipment.

## Protocol nuances (why this is ONDC-peculiar)

- **AWB is the shipment key** for tracking and settlement across the logistics leg.
- **Label is a document reference** — commonly a URL to a printable label, carried in fulfillment tags.
- **Logistics-domain concern** — appears in the LOG flow, surfaced to retail via linkage (see `49`).

## Sources

- ONDC-LOG-Specifications
- ONDC-RET-Specifications
