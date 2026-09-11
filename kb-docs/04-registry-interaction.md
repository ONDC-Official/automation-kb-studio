# Registry Interaction

## Objective

Explain the registry as the network's **trust & identity anchor** and the interactions an NP has with it — onboarding via the NP Portal (Subscribe **v1.1**), `/v1.1/subscribe`, lookup, vlookup. Frames "when and why an NP talks to the registry" from a protocol lens. Does NOT re-explain the signature algorithm (see `01`), the challenge decrypt (see `02-onboarding-subscribe`), or the lookup key-resolution detail (see `03-lookup`).

## Prerequisite

- Registration on the **NP Portal** with an **Environment Access Request** to whitelist the `subscriber_id` (FQDN).
- Ed25519 signing + X25519 encryption key pairs generated **in the portal**.
- A valid SSL certificate (for OCSP validation).

## Deliverable

An NP that is registered (public keys discoverable) and can resolve any counterparty's keys at verification time.

## The registry, in one line

ONDC-operated **"DNS + public-key directory"** — NPs never build it; they register into it and query it. It is the single source of truth for who is on the network and what their keys are.

## What the registry stores per NP

`subscriber_id` (FQDN) · `subscriber_url` · `signing_public_key` (Ed25519) · `encr_public_key` (X25519) · `unique_key_id` · `type` (BAP | BPP | BG) · `domain` · `status` · `city`.

## Guideline (the interactions)

1. **Portal onboarding** — register on the NP Portal, raise an Environment Access Request to whitelist the `subscriber_id`, and generate the key pairs. The portal issues a **`request_id`** (UUID v4).
2. **DNS verification (Production only)** — publish `ondc-signature` (Ed25519-signed `request_id`) and `ondc-challenge` (encrypted `request_id`) as **DNS TXT records** at the domain root. Pre-Prod skips this.
3. **`/v1.1/subscribe`** — POST `request_id`, `entity`, `key_pair`, `network_participant` to register keys + metadata. Triggers registry validation (schema, SSL OCSP, DNS TXT check + challenge decrypt in Production).
4. **`/v2.0/lookup`** (lookup 2.0) — resolve a counterparty's public key at verification time, via a signed Authorization header. `/lookup` and `/vlookup` are deprecated. See `03-lookup`.

## Protocol nuances (why this is ONDC-peculiar)

- **Onboarding moved to the portal (v1.1).** Keys are generated in the NP Portal and domain ownership is proven via **DNS TXT records**, replacing the older HTML site-verification and the `/on_subscribe` challenge-callback (deprecated).
- **DNS validation is Production-only.** Pre-Prod supports direct subscription without DNS records.
- **Two live environments** — Pre-Prod and Prod, each with its own registry host (`preprod.registry.ondc.org`, `prod.registry.ondc.org`), both using the standard `/v2.0/lookup` path (no `/ondc/` prefix). **Staging is deprecated.**
- **Whitelisting precedes subscribe** — the `subscriber_id` must be whitelisted via an Environment Access Request before `/v1.1/subscribe` succeeds.
- **The registry is read on the hot path** — every inbound verification may hit `/lookup`; caching (invalidated on failure) keeps this from becoming a per-request round trip.

## Sources

- ONDC developer-docs `registry/Onboarding of Participants.md`
- ONDC developer-docs `registry/signing-verification.md`; ONDC-Registry-Specifications
