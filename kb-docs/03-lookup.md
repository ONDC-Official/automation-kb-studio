# Lookup (Registry /v2.0/lookup)

## Objective

Explain how an NP **resolves another NP's current public key** from the registry so it can verify a signature. Covers the current **lookup 2.0** (`/v2.0/lookup`), its request/response, and when caching applies. Does NOT cover the onboarding flow (see `02-onboarding-subscribe`) or the signature math (see `01-signature-verification`).

## Prerequisite

- A `keyId` from an inbound header, split into `subscriber_id` + `unique_key_id` + `algorithm`.
- The NP's own Ed25519 signing credentials (lookup 2.0 requires a signed request — see below).
- Registry reachability for the target environment (Pre-Prod / Prod).

## Deliverable

The verifying NP obtains the correct Ed25519 public key for `subscriber_id + unique_key_id` to feed into verification.

## Current version: lookup 2.0

`/v2.0/lookup` is the **current, recommended** endpoint. `/lookup` and `/vlookup` are both **deprecated** and should not be used for new implementations.

- **Secure by Authorization header.** lookup 2.0 authenticates via a standard **Authorization header** with an Ed25519 signature (e.g. `keyId="example-bap.com|bap1234|ed25519", algorithm="ed25519"`), rather than the embedded request-body signature the old `/vlookup` required.
- It supersedes both older endpoints — the signed-response mechanism of `/vlookup` and the basic `/lookup` are folded into this one secure, header-authenticated call.

## Request & response

**Request** — `POST /v2.0/lookup` with a **signed Authorization header** (Ed25519, same format as any request):

```
POST https://prod.registry.ondc.org/v2.0/lookup
Authorization: Signature keyId="example-bap.com|bap1234|ed25519",algorithm="ed25519",
  created="…",expires="…",headers="(created)(expires)digest",signature="…"
Content-Type: application/json

{ "country": "IND", "domain": "ONDC:RET10" }
```

**Searchable/filter fields** in the body — the request is a filter over: `subscriber_id`, `unique_key_id` (ukId), `domain`, `type` (BAP | BPP | BG), `country`, `city`. **At least two of these must be sent** (e.g. `country` + `domain`, as in the example). To resolve one specific key for verification, filter by **`subscriber_id` + `unique_key_id`**.

**Response** — an **array of matching subscriber records**; each record carries the fields the registry stores per NP:

- `subscriber_id` (FQDN), `subscriber_url`
- `type` (BAP | BPP | BG), `domain`, `city`, `country`
- `signing_public_key` (Ed25519), `encr_public_key` (X25519)
- `unique_key_id` (ukId)
- `valid_from`, `valid_until` (key validity window)
- `status` (e.g. SUBSCRIBED)

> The exact field-level JSON schema is published in the **ONDC Registry Onboarding 2.1.0** API (SwaggerHub) / ONDC-Registry-Specifications — the field list above matches the registry's stored subscriber record.

## Guideline (lookup path)

1. From the inbound header's `keyId`, take `subscriber_id` and `unique_key_id`.
2. Query the registry `/v2.0/lookup` (or the cache) for that pair, signing the request with your own Ed25519 credentials in the Authorization header.
3. Use the returned public key in `verify-request`.
4. On verification failure, **re-fetch** (the key may have rotated) rather than trusting a stale cache entry.

## Protocol nuances (why this is ONDC-peculiar)

- **Keyed by `subscriber_id + unique_key_id`, not just subscriber.** An NP can have multiple registered keys (for rotation); the `unique_key_id` selects the right one.
- **The lookup call is itself authenticated.** lookup 2.0 requires a signed Authorization header — resolving a key is a signed request, not an anonymous GET.
- **At least two filter parameters are required** — a single-field lookup is rejected; combine two or more of subscriber_id / ukId / domain / type / country / city.
- **Environment-specific endpoints** — two live environments, each with its own registry host, both using the standard `/v2.0/lookup` path (no `/ondc/` prefix):
  - Pre-Prod: `https://preprod.registry.ondc.org/v2.0/lookup`
  - Production: `https://prod.registry.ondc.org/v2.0/lookup`
  - (Staging is **deprecated** — only Pre-Prod and Prod are in use.)
- **Cache, but invalidate on failure.** Caching public keys avoids a lookup per request; a verification failure is the signal to invalidate and re-fetch (rotation).

## Sources

- ONDC developer-docs `registry/Onboarding of Participants.md` (point 13 — lookup 2.0 recommended; `/lookup` and `/vlookup` deprecated)
- ONDC developer-docs `registry/signing-verification.md`; ONDC-Registry-Specifications
- ONDC Registry Onboarding 2.1.0 API (SwaggerHub) — field-level request/response schema
- ONDC-Official profile README — Gateway and Registry Endpoints (environment URLs)
