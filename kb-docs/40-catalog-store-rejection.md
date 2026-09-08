# Catalog & Store Rejection Framework

## Objective

Explain reporting **rejected catalogs / stores** per the ONDC framework (Retail B2C). Does NOT cover order rejection (see `22`).

## Prerequisite

- A published catalog whose items/stores may be rejected by the BAP.

## Deliverable

Structured feedback on which catalog items or stores were rejected and why, per the framework's schema.

## The idea, in one line

When a BAP cannot list a seller's catalog item or store, it reports the **rejection with a reason** back to the BPP using the Catalog/Store Rejection framework, so sellers can fix and re-publish.

## Real structure (catalog-rejection spec + GCR)

- **Endpoint:** the BPP-side `POST /catalog_rejection` (per the `catalog-rejection` swagger, `post_catalog_rejection`).
- **Payload carries:**
  - **Rejection details** for the rejected **bpp / provider / item** (what was rejected and why).
  - (With GCR) **successful provider** details **plus the provider deeplink** — the URL where that provider can be accessed on the buyer app.
  - Additional **error scenarios and codes** beyond the base set (extended for the GCR flow).
- **Two report paths under GCR (see `31`):** one **from GCR** at ingestion (rejections + successful providers, no deeplink); one **from a Buyer App forwarded through GCR** (rejections + successful providers **with** deeplink), identifiable by the `x-gateway-authorization` GCR signature and a **different transaction_id** from GCR's ingestion search.

## Guideline

1. Evaluate incoming catalog items/stores against listing rules.
2. For each rejected bpp/provider/item, record the **reason** per the framework's schema; include successful providers + deeplinks where required.
3. `POST /catalog_rejection` back to the seller (directly, or via GCR which forwards it).

## Protocol nuances (why this is ONDC-peculiar)

- **Rejection is structured feedback, not silence.** The framework defines a schema/swagger for reporting, so rejections are actionable.
- **Catalog/store level, not order level** — this is about what can be *listed*, distinct from rejecting an *order* (see `22`).
- **Retail B2C scoped.**

## Sources

- ONDC `catalog-rejection` (framework doc + swagger)
- ONDC-RET-Specifications
