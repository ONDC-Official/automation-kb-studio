# GCR — Global Catalog Repository

## Objective

Explain the **Global Catalog Repository (GCR)** — an ONDC 2.0 infrastructure component that centralizes, standardizes, validates and distributes catalog data — and how it changes the `search` / `on_search` flow for Buyer and Seller Apps. Does NOT cover the catalog object model itself (see `36`) or the rejection payload schema (see `40`).

## Prerequisite

- Familiarity with the normal discovery flow (`search` via gateway → sellers reply `on_search` direct — see `07`, `36`, `37`).

## Deliverable

Buyer and Seller Apps integrated with GCR: sellers push their catalog **once** to GCR; buyers pull a validated, enriched catalog **from** GCR instead of from every seller.

## What GCR is, in one line

GCR is the network's **single source of truth for catalog data** — sellers publish once to GCR, GCR validates/enriches/caches it, and buyers pull from GCR — replacing the decentralized model where every buyer ingests from every seller.

## Why it exists (the M×N problem)

With **M** Buyer Apps and **N** Seller Apps, the current model costs **M×N** `on_search` exchanges for a full catalog, repeated daily. GCR collapses this:
- **Sellers:** push **M×N → N** (publish once to GCR); after the first full ingest, daily full pushes drop to **0** (only incremental updates thereafter).
- **Buyers:** the daily full pull eventually **diminishes to 0** — everything arrives as incremental updates from GCR.
- Plus: consolidated catalog rejection, unified search, Gzip-compressed payloads, lower ingestion cost.

## How NPs interact with GCR

NPs use the **same `/search` + `/on_search` construct** — GCR sits in the middle. Pre-Prod details:

| Role | GCR detail | Endpoint / id |
|---|---|---|
| Seller Apps | GCR subscriber_id (GCR → seller search, seller → GCR on_search) | `pre-prod.gcr.ondc.org` |
| Buyer Apps | send `search` to GCR | `https://preprod.gateway.ondc.org/search` |
| Seller Apps | respond with `on_search` to GCR | `https://pre-prod.gcr.ondc.org/on_search` |
| Seller Apps | trigger on-demand full-catalog pull | `http://pre-prod.gcr.ondc.org/mgmt/api/v1/catalog/pull` |

## Generic vs buyer-specific catalog (the key distinction)

GCR tells them apart by the **`bap_id`** in the seller's `on_search`:
- **Generic catalog** — same for all buyers → seller uses the **GCR subscriber_id as `bap_id`**. GCR fans it to all permitted buyers.
- **Buyer-specific catalog** — different price/attributes per buyer (e.g. price Pr1 to B1, Pr2 to B2) → seller uses the **specific Buyer App's subscriber_id as `bap_id`**; GCR shares it only with that buyer.

## Seller App Authorization

The equivalent of a seller's ACK/NACK choice in the current construct: the seller controls **whether GCR may share its `on_search` catalog with a given Buyer App**, and can update these access policies. GCR honours it before distributing.

## Phase 1 features

Catalog repository (GCR pulls/refreshes from sellers) · buyer full-catalog pull (current search construct) · seller on-demand full pull · incremental catalog pull (buyers subscribe) · incremental push (generic + buyer-specific) · **protocol validation** (static schema checks) · **catalog rejection** (static + dynamic, relayed both ways) · caching · **seller authorization** · buyer-app deeplinks in the rejection report · **Gzip** compression (GCR → buyer always Gzip; seller → GCR json or Gzip, Gzip recommended).

## Changes required

**Buyer Apps:** still send `search` to the gateway (Must); stop the daily full-catalog cron (Recommended, on-demand instead); **consume `on_search` from GCR** (Must); **subscribe to GCR** for incremental updates (Must); send catalog rejection to **GCR** (which forwards to sellers) with the added success-provider + deeplink details (Must).

**Seller Apps:** **whitelist the GCR subscriber_id** and recognize search from GCR (Must); if `bap_id` = GCR → ACK and send `on_search` to GCR; if `bap_id` = a Buyer App → ACK/NACK only, do **not** send `on_search` (GCR serves the buyer) (Must); during ingestion send **generic full catalog first** (bap_id = GCR), then buyer-specific full/incremental (bap_id = buyer) (Must if buyer-specific exists); send incremental updates to GCR (Must).

## Protocol nuances (why this is ONDC-peculiar)

- **`bap_id` is the routing switch** — it's how GCR classifies generic vs buyer-specific and how a seller knows whether a search is from GCR or a buyer.
- **Two rejection paths** — one **from GCR** at ingestion (rejections + successful providers, no deeplink), and one **from a Buyer App forwarded through GCR** (identified by an `x-gateway-authorization` header carrying the **GCR signature**, and a **different transaction_id** from GCR's original search).
- **`on_search` no longer comes from sellers to buyers directly** — GCR becomes the buyer's `on_search` source. This is a real change from the peer-to-peer `on_search` in the base construct (see `07`).
- **Pre-Prod only today** — GCR is available in Pre-Prod for NP testing.

## Sources

- ONDC GCR PRD (Global Catalog Repository) + GCR SwaggerHub API
- ONDC `catalog-rejection` spec (`ondc-official.github.io/catalog-rejection`)
