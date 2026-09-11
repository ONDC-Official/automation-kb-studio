# Key Rotation

## Objective

Explain rotating an NP's signing/encryption keys **without downtime**, using `unique_key_id` and multiple registered keys. Does NOT cover initial key generation (see `26`) or caching mechanics (see `29`).

## Prerequisite

- An onboarded NP with at least one registered key pair and its `unique_key_id`.

## Deliverable

A new active key registered and in use, with in-flight requests signed by the old key still verifiable during the overlap.

## The idea, in one line

Rotate by **registering a new key with a new `unique_key_id`** and running both keys in parallel during an overlap window, so nothing signed with the old key fails mid-flight.

## Guideline

1. Generate a new key pair (see `26`) and a new **`unique_key_id`**.
2. Register it (the registry holds **multiple keys** per NP, distinguished by `unique_key_id`).
3. Start signing new requests with the new key (its `keyId` carries the new `unique_key_id`).
4. Keep the old key valid during an **overlap window** so receivers can still verify in-flight requests signed with it (they resolve by `subscriber_id + unique_key_id`).
5. Retire the old key after the window.

## Protocol nuances (why this is ONDC-peculiar)

- **`unique_key_id` is what makes zero-downtime rotation possible** — each key is independently resolvable, so old and new can coexist.
- **Receivers resolve by `subscriber_id + unique_key_id`** — a rotated request just points at the new key; caches invalidate on failure and re-fetch (see `29`).
- **Overlap, don't cut over hard.** Retiring the old key before in-flight requests drain will fail their verification.

## Sources

- ONDC developer-docs `registry/signing-verification.md` (`keyId` / `unique_key_id` usage)
- ONDC developer-docs `registry/Onboarding of Participants.md`
