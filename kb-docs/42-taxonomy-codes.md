# Taxonomy & Category / Domain Codes

## Objective

Explain the authoritative **category codes** (e.g. `RET10`, `RET11`, …) and **domain codes** used across ONDC. Does NOT define item attributes in detail (see `38`).

## Prerequisite

- A message needing a `domain` and item `category_id`.

## Deliverable

Correct, authoritative domain and category codes on catalog and context.

## The idea, in one line

Domains and categories are **enumerated codes** from the ONDC taxonomy — `context.domain` uses codes like `ONDC:RET11`; items use category codes from the Category Taxonomy — and only listed codes are valid.

## Retail domain codes (Category Taxonomy v1.2)

| Code | Domain | | Code | Domain |
|---|---|---|---|---|
| RET10 | Grocery | | RET15 | Appliances |
| RET11 | F&B | | RET16 | Home & Kitchen |
| RET12 | Fashion | | RET18 | Health & Wellness |
| RET13 | BPC (Beauty & Personal Care) | | RETeB2B | eB2B |
| RET14 | Electronics | | | |

Used as `ONDC:RET10` … in `context.domain`. Other verticals follow the same pattern: `LOG` (logistics), `FIS` (financial services), `TRV` (travel), `SRV` (services), `ONEST`.

## Category structure

- Each domain has its own **category list** with a `category id` and a `parent_category_id`. E.g. **F&B (RET11)** has ~72 categories (`Biryani`, `Burger`, `Cakes`, `Dosa`, `Chaat`, …) under parent `F&B`; **Grocery (RET10)** has ~39 (`Fruits and Vegetables`, `Masala & Seasoning`, `Oil & Ghee`, …).
- The taxonomy also defines, **per category, the mandatory (M) vs optional (O) item attributes** — e.g. Fashion `Shirts` require Gender/Colour/Size/Brand/Fabric; Electronics `Mobile Phone` requires Brand/Model/Colour/RAM. Items set `category_id` / `category_ids` from this list (see `36`, `38`).
- The taxonomy is **versioned** (v1.2, with a Changelog sheet).

## Guideline

1. Set `context.domain` to an enabled domain code (see `33`).
2. Set item `category_id` from the authoritative category taxonomy for that domain.
3. Keep to the enumerated codes — custom codes fail validation.

## Protocol nuances (why this is ONDC-peculiar)

- **Codes are authoritative and centrally maintained** (Common Taxonomy Project + Enabled Domains). Don't invent category/domain codes.
- **Domain code shapes routing + schema** (see `33`), category code shapes discovery/attributes.
- **Versioned** — taxonomy evolves; use the current set for the domain/version.

## Sources

- ONDC Category Taxonomy v1.2 (retail domain sheets RET10–RET18 + eB2B) + EB2B Category Taxonomy
- ONDC `Common-Taxonomy-Project`; developer-docs (Enabled Domains)
