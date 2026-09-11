# Serviceability (Geo / Pincode / Radius)

## Objective

Explain how a provider expresses **where it serves** and rejects out-of-area requests. Does NOT cover logistics (see `49`).

## Prerequisite

- A catalog with provider locations (see `36`).

## Deliverable

Serviceability declarations that let a BAP filter, and a BPP correctly accept or reject by area.

## The idea, in one line

A provider declares its serviceable area — most commonly a **circle** (`gps` centre + `radius`) around a location, or by **pincode / geo-polygon** via serviceability tags — and requests outside it are rejected.

## Real structure (RET11 F&B attributes)

Each provider `location` carries:
- **`gps`** — the location's physical coordinates (`"77.2045,28.5697"`).
- **`circle`** — the serviceable zone: **`circle.gps`** (centre) + **`circle.radius`** = `{ value: "3", unit: "km" }`.

The BAP checks whether the buyer's delivery point falls inside the circle. Pincode-list and polygon serviceability are expressed via **`@ondc/org/serviceability` tags** on the location/fulfillment (tag types distinguish hyperlocal-circle vs pincode vs pan-India).

## Guideline

1. Declare serviceability per location — a `circle` (gps + radius value/unit), or a pincode/polygon serviceability tag.
2. On `search`/`select`, evaluate the buyer's delivery location against it.
3. If out of area, **reject** (NACK / serviceability error — see `15`, e.g. `60001`/`60002`).

## Protocol nuances (why this is ONDC-peculiar)

- **Multiple serviceability models** — pincode, geo-polygon, and radius all exist; a provider picks per location.
- **Out-of-area is an error, not an empty result** — the BPP signals it explicitly (serviceability error codes `60001`/`60002` in the logistics/RET error set — see `15`).
- **Expressed in tags** tied to locations/fulfillments.

## Sources

- ONDC-RET-Specifications
- ONDC automation-specifications `config/attributes`, `config/errors/index.yaml` (branch `draft-RET11-1.2.5`)
