# Quote & Price Breakup

## Objective

Explain the structure of `quote.breakup`, totals and the quote TTL. Does NOT cover settlement/reconciliation (out of scope).

## Prerequisite

- A `select` → `on_select` (or `init`) that returns a quote (see `19`).

## Deliverable

A quote whose line items sum to its total and whose validity is bounded.

## The idea, in one line

`quote` = a **`price` total** plus a **`breakup[]`** of line items, where the breakup **must reconcile to the total**.

## Real breakup titles (RET11)

Each breakup line carries a title/type, a price, and (for item lines) the item reference. Confirmed title values include: **item**, **Tax**, **Delivery**, **Discount** (`discount`), **Packing**, **Convenience Fee**. Delivery charges and taxes appear as their own titled lines; discounts are negative lines.

## Guideline

1. Build `quote.breakup[]` with a titled line per charge (item, tax, delivery, discount, …).
2. Set `quote.price` = the sum of the breakup.
3. Bind validity with the quote's TTL; a stale quote must be re-fetched.

## Protocol nuances (why this is ONDC-peculiar)

- **Breakup must sum to total** — a cross-field `x-validation` (see `16`); a mismatch is rejected.
- **Titled line items** — each breakup entry is typed/titled, not free-form, so BAP and settlement can interpret it.
- **Quote has a TTL** — act within it; `on_confirm` after expiry is invalid (see `12`).

## Sources

- ONDC-RET-Specifications; ONDC-Protocol-Specs core API contract
- ONDC automation-specifications `config/validations/index.yaml` (branch `draft-RET11-1.2.5`)
