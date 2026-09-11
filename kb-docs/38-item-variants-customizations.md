# Item Variants & Customizations

## Objective

Explain modelling **variant groups**, **customizations** and attributes on catalog items. Does NOT cover price breakup (see `43`).

## Prerequisite

- A catalog with items (see `36`).

## Deliverable

Items whose variants (e.g. size/colour) and customizations (e.g. add-ons) are expressed so a BAP can present choices and a BPP can price them.

## The idea, in one line

**Variants** are alternate forms of an item grouped by a **variant group** (attribute-driven), and **customizations** are optional add-ons/choices — both modelled via item relationships and **tags**, not free-form fields.

## Real structure (RET11 F&B attributes)

- **Customization groups = provider `categories`.** A category `id` + `descriptor.name` names the group, e.g. `"Toppings (up to 2 options)"`, `"Size"`. Items reference the group via `category_ids` (`category:subcategory`).
- **`parent_item_id`** links a customization / child item back to its **base item**, expressing the item hierarchy (add-ons/variants nested under a base product). This `items` array is anchored in session as `selected_items` and replayed through `select` → `init` → `confirm`.
- **`customization` tag** on a selected item distinguishes a **base item** from a **customization** belonging to a specific customization group.
- **Variant grouping keys off defined item attributes** (from the taxonomy — see `42`), with lower/upper price-range tags spanning the variants.

## Guideline

1. Define the **customization/variant group** as a provider `category` (`id` + `descriptor.name`).
2. Mark customizations with the `customization` tag and link them to the base item via `parent_item_id`.
3. The BAP renders choices; the BPP prices the selected base+customization combination at `select`.

## Protocol nuances (why this is ONDC-peculiar)

- **Attribute-driven variants.** Variant grouping keys off defined item attributes (from the taxonomy — see `42`), not arbitrary labels.
- **Customizations carry their own ids and pricing** — they appear in the quote breakup at `select`/`init`.
- **Modelled in `tags` / related objects** — like most ONDC item detail, this rides in structured tag groups.

## Sources

- ONDC-RET-Specifications
- ONDC automation-specifications `config/attributes` (branch `draft-RET11-1.2.5`)
