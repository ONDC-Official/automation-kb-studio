# Static Terms

## Objective

Explain the **static terms** a domain requires NPs to host/publish. Does NOT cover the dynamic catalog (see `36`).

## Prerequisite

- An onboarded NP for the domain.

## Deliverable

Hosted static terms (the domain-mandated policy/terms content) referenced correctly on the network.

## The idea, in one line

Some domain terms are **static** — fixed policy/terms content NPs must publish (per the `static-terms` repo) — as opposed to the dynamic, per-transaction catalog.

## Real structure (`static-terms` repo)

- Static terms are **PDF files** hosted per NP, submitted to the ONDC `static-terms` repo by **fork + pull request** (maintainer-approved).
- **Path convention:** `[DOMAIN]/[NP-Name]/[Version]/static_terms.pdf` — e.g. `RET/BNP/0.1.0/static_terms.pdf`, `LOG/LSP/0.1.0/static_terms.pdf`.
- **Domains present:** `RET` (Retail), `LOG` (Logistics), `FIS12` (Financial Services), `SRV` (Services), `TRV` (Travel), `ONEST`.
- NP names use **hyphens, no spaces**; version folders hold successive iterations.

## Guideline

1. Author the domain's static terms as a **PDF**.
2. Submit via fork + PR under `[DOMAIN]/[NP-Name]/[Version]/static_terms.pdf`.
3. Reference the published terms where the contract expects (terms links in the order/catalog).

## Protocol nuances (why this is ONDC-peculiar)

- **Static ≠ catalog.** These are fixed terms/policies, not per-order data; they change rarely and are centrally defined.
- **Domain-specific** — the required set is per domain, maintained in `static-terms`.

## Sources

- ONDC `static-terms`
- ONDC-RET-Specifications
