# Signature Verification Skill (Code)

## Objective

A code-level **skill wrapping the crypto utility** for signing/verifying requests. Does NOT re-explain the algorithm theory (see `01`, `27`, `28`).

## Prerequisite

- Understanding of digest (see `27`), header creation (see `28`) and verification (see `01`).

## Deliverable

A reusable sign/verify utility an NP can drop into request middleware.

## The idea, in one line

Wrap the ONDC crypto reference (`signing_and_verification` utilities) into a sign function (build header) and a verify function (check inbound), so application code never re-implements the crypto.

## Guideline

1. **Sign:** BLAKE-512 digest → signing string → Ed25519 sign → assemble `Authorization` (see `28`).
2. **Verify:** parse `keyId` → lookup key (see `03`) → recompute digest + signing string → Ed25519 verify → window check (see `01`).
3. Use the reference implementations rather than hand-rolling; keep the signing string **byte-exact** (see `28`).

## Protocol nuances (why this is ONDC-peculiar)

- **Reuse the reference utility** — `reference-implementations/utilities/signing_and_verification` exists in py/go/ruby/java; hand-rolled crypto risks the byte-exact traps (see `28`).
- **Byte-exact signing string** — the doc/SDK spacing discrepancy (see `28`) is exactly why a shared utility matters.
- **Skill = wrapper, not new crypto** — it packages the existing algorithm for reuse.

## Sources

- ONDC `reference-implementations` `utilities/signing_and_verification` (py/go/ruby/java)
- ONDC `ondc-crypto-sdk-go`
