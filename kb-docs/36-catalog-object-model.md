# Catalog Object Model

## Objective

Explain how a catalog is structured in `on_search` — providers, items, categories, fulfillments. Does NOT cover incremental refresh (see `37`) or item variants (see `38`).

## Prerequisite

- A `search` → `on_search` exchange (see `07`).

## Deliverable

A well-formed `catalog` in `on_search` that a BAP can render and select from.

## The structure, in one line

`on_search.message.catalog` = a **BPP descriptor** holding **providers**, each with **items**, **categories**, **fulfillments**, **locations**, and **offers** — the item is the sellable unit.

## Guideline (the nesting)

1. **Catalog** → `bpp/descriptor` + `bpp/providers[]` (+ `bpp/fulfillments`).
2. **Provider** → `descriptor`, `locations[]`, `categories[]`, `items[]`, `fulfillments[]`, `offers[]`, `tags`.
3. **Item** → `descriptor`, `price`, `category_id`, `fulfillment_id`, `location_id`, quantity/availability, `tags`.
4. **Category / Fulfillment / Location** are referenced by id from items.

## Real fields (RET11 F&B attributes)

- **Item ids/links:** `category_id`, `category_ids` (colon-separated `category:subcategory`), `fulfillment_id`, `location_id`, `parent_item_id` (links a customization/child item to its base item — see `38`).
- **Item `@ondc/org` tags:** `returnable`, `cancellable`, `available_on_cod`, `return_window` (ISO8601), `seller_pickup_return`, `time_to_ship` (ISO8601), `contact_details_consumer_care`, `statutory_reqs_packaged_commodities`, `statutory_reqs_prepackaged_food`, `fssai_license_no`.
- **Provider:** `locations[]` (each with `gps` + a `circle` serviceability zone — see `39`), `categories[]` (`id` + `descriptor.name`, e.g. `"Toppings (up to 2 options)"` — used as customization groups), `parent_category_id` (category hierarchy), provider-level `tags` (timings, serviceability rules).
- **Price range:** items can carry lower/upper price-range tags spanning variants/offers.

## Protocol nuances (why this is ONDC-peculiar)

- **Id references, not nesting.** Items point at `category_id` / `fulfillment_id` / `location_id`; the referenced objects live alongside, not inside, the item.
- **`tags` carry the protocol detail.** Much ONDC-specific behaviour (serviceability, attributes, offers) rides in `tags` blocks, not first-class fields.
- **The item is the unit of selection** — `select` references item ids from this catalog.

## Sources

- ONDC-RET-Specifications; ONDC-Protocol-Specs core API contract
- ONDC automation-specifications `config/attributes` (branch `draft-RET11-1.2.5`)
