# Digest Generation — BLAKE-512

## Objective

Explain hashing the request **body** with **BLAKE-512** to produce the `digest` that goes into the signing string. Does NOT cover building the header/signature (see `28`) or verification (see `01`).

## Prerequisite

- The exact request body bytes to be sent.

## Deliverable

A base64 `digest` over the request body, ready to place in the signing string.

## The rule, in one line

Hash the request body with **BLAKE-512** (`blake2b`, 64-byte output) and base64-encode it — over the payload **exactly as passed**, with **no canonicalization**.

## Guideline

1. Take the request body **exactly as it will be sent** (byte-for-byte).
2. Compute **BLAKE-512** over those bytes (`blake2b.New(64, nil)` in the Go SDK).
3. Base64-encode (standard encoding) → the `digest` value.
4. Place it in the signing string as `digest: BLAKE-512=<base64>` (see `28`).

## Protocol nuances (why this is ONDC-peculiar)

- **Byte-exact, no canonicalization.** The digest is over the payload as-passed; the SDK does no JSON parse/re-serialize. Re-serializing before hashing breaks the digest.
- **"Minified" is a convention, not an algorithm step.** Both sides must hash the *identical* byte string; minifying is just the agreed way to guarantee that. A serialization mismatch = verification fails.
- **Digest hashes the body, not the signing string.** The signing string (with `created`/`expires`/`digest`) is later signed **without** its own hash step.
- **BLAKE-512, not SHA.** Using the wrong hash is a silent interop failure.

## Sources

- ONDC developer-docs `registry/signing-verification.md`
- ONDC `ondc-crypto-sdk-go` (byte-exact BLAKE-512, no canonicalization)
