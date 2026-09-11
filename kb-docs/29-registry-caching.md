# Registry Caching of Public Keys

## Objective

Explain caching subscriber **public keys** to avoid a registry `/lookup` on every inbound request, and when to invalidate. Does NOT cover the lookup call itself (see `03-lookup`) or rotation (see `30-key-rotation`).

## Prerequisite

- A working `/v2.0/lookup` path (see `03`) and inbound requests to verify.

## Deliverable

A local cache of public keys keyed by `subscriber_id + unique_key_id`, kept correct across rotation.

## The idea, in one line

Cache each subscriber's public key **by `subscriber_id + unique_key_id`** so verification doesn't hit `/lookup` per request — and **re-fetch on a verification failure**, since the key may have rotated.

## Guideline

1. On first need, resolve the key via `/v2.0/lookup` and cache it under `subscriber_id + unique_key_id`.
2. Serve subsequent verifications from the cache.
3. On a **verification failure**, invalidate that entry and **re-fetch** (the key may have rotated).
4. Apply a TTL to bound staleness.

## Protocol nuances (why this is ONDC-peculiar)

- **Cache key must include `unique_key_id`.** An NP can hold multiple keys; caching by `subscriber_id` alone returns the wrong key after rotation.
- **Failure is the invalidation signal.** A previously-valid signature that now fails is the cue to drop the cache entry and re-lookup — not to NACK outright.
- **Freshness vs load trade-off.** Longer TTL = fewer lookups but slower to see a rotated key; the failure-triggered re-fetch is the safety net.

## Sources

- ONDC developer-docs `registry/signing-verification.md` (cached-copy note)
- ONDC developer-docs `registry/Onboarding of Participants.md`
