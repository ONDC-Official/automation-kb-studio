# City & State Codes Usage

## Objective

Explain using ONDC **city / pincode and state codes** inside `context`. Does NOT cover GPS coordinates.

## Prerequisite

- A message whose `context` needs a city/country.

## Deliverable

Correct city/state codes in `context` so routing and serviceability work.

## The idea, in one line

`context.city` (and country) use **standardized codes** — city codes are `std:<STD-code>` (e.g. `std:080` for Bengaluru), with authoritative City-codes / State-codes lists.

## Guideline

1. Set `context.city` from the authoritative City-codes list (STD-based).
2. Use state codes where the contract expects them.
3. Match city to serviceability and gateway routing (the BG fans `search` by domain + city — see `05`).

## Protocol nuances (why this is ONDC-peculiar)

- **Codes, not names.** City is an STD-based code (`std:080`), not a free-text name.
- **City drives gateway routing** — `search` broadcast is by domain + city (see `05`), so a wrong code misroutes discovery.
- **Authoritative lists** — City-codes.md / State-codes.md in developer-docs.

## Sources

- ONDC developer-docs `City-codes.md`, `State-codes.md`
