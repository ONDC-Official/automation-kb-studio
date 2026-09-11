# Authorization Header Creation

## Objective

Explain building the **`Authorization` header** on an outbound request — assembling `created`, `expires`, `digest`, the Ed25519 `signature`, and `keyId`. This is the sender side of signing. Does NOT cover the gateway header (see `05`) or verification (see `01`).

## Prerequisite

- A registered Ed25519 signing key pair and its `unique_key_id` (see `26`).
- The request body and its BLAKE-512 `digest` (see `27`).

## Deliverable

A request carrying a valid `Authorization: Signature …` header, ready to send peer-to-peer or via the gateway.

## Guideline (build order)

1. **Digest** the body (BLAKE-512, base64 — see `27`).
2. **Timestamps** — `created` = now (unix), `expires` = now + validity (unix; SDK default `created + 3600s`).
3. **Build the signing string** — three newline-separated lines:
   ```
   (created): <unix>
   (expires): <unix>
   digest: BLAKE-512=<base64>
   ```
4. **Sign** the byte-exact signing string with **Ed25519** (`crypto_sign_detached`) → base64 `signature`. No extra hashing of this string.
5. **Assemble the header** (note the single spaces in `headers`):
   ```
   Signature keyId="<subscriber_id>|<unique_key_id>|ed25519",algorithm="ed25519",created="<unix>",expires="<unix>",headers="(created) (expires) digest",signature="<base64>"
   ```

## Protocol nuances (why this is ONDC-peculiar)

- **The signing string is signed byte-exact — use the spaced form.** Production verifiers accept the **spaced** byte form: `(created): <ts>\n(expires): <ts>\ndigest: BLAKE-512=<b64>` and `headers="(created) (expires) digest"` (single spaces between the three). The older no-space registry-doc form is wrong; a byte difference fails an otherwise-valid signature. Confirmed authoritative header, e.g.:
  ```
  Signature keyId="buyer-app.ondc.org|207|ed25519",algorithm="ed25519",created="1641287875",expires="1641291475",headers="(created) (expires) digest",signature="fKQW…+Bw=="
  ```
- **Ed25519 signs the string directly** — no pre-hash of the signing string (only the body is hashed, into `digest`).
- **`keyId` = `subscriber_id|unique_key_id|ed25519`** — the receiver splits it to fetch your key (see `03`).
- **`expires` bounds validity** — SDK default is `created + 3600s`; a receiver rejects `created` in the future or `now > expires`.

## Sources

- ONDC developer-docs `registry/signing-verification.md`
- ONDC `ondc-crypto-sdk-go`; reference-implementations `utilities/signing_and_verification`
