# Full vs Incremental Catalog Refresh

## Objective

Explain when to send a **full** catalog vs an **incremental** update in `on_search`, and the tags that drive it. Does NOT cover item modelling (see `36`).

## Prerequisite

- A catalog to publish (see `36`).

## Deliverable

A refresh strategy that keeps the BAP's catalog current without resending everything each time.

## The idea, in one line

A `search` can request the **full** catalog or an **incremental** delta; the mode and window are signalled via **tags** in the `search` intent and honoured in `on_search`.

## Real structure (RET11 F&B attributes)

The mode is declared in the **`intent.tags`** of the `search`: a tag group whose `code` names the catalog mode (e.g. **`catalog_full`** / **`catalog_inc`**) with a `list` entry `code: mode` and its value. The BPP reads this to decide whether to return the whole catalog or a delta. GCR uses the same construct (see `31`).

## Guideline

1. **Full** — return the complete catalog (initial pull or periodic full sync); intent tag = catalog-full.
2. **Incremental** — return only items/prices changed in the window; intent tag = catalog-incremental (`catalog_inc` + `mode`), buyer subscribed to updates.
3. Match the `on_search` mode to what the `search` requested.

## Protocol nuances (why this is ONDC-peculiar)

- **The mode is tag-driven.** Whether a search wants full or incremental (and the time window) is expressed in `intent` tags, not a top-level field.
- **Incremental cuts payload size** for large catalogs, but the BAP must merge deltas onto its held copy.
- **RET-specific flows exist** — the automation-specifications ship dedicated `FULL_CATALOG`, `INCREMENTAL_CATALOG`, and `INCREMENTAL_CATALOG_PULL` flows.

## Sources

- ONDC-RET-Specifications
- ONDC automation-specifications `config/flows/F&B/FULL_CATALOG.yaml`, `INCREMENTAL_CATALOG*.yaml` (branch `draft-RET11-1.2.5`)
