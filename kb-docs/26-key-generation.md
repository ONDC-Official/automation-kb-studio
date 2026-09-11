# Key Generation

## Objective

Explain generating an NP's **two key pairs** — Ed25519 for signing and X25519 for encryption. Covers what each is for and how they differ. Does NOT cover registering them (see `02-onboarding-subscribe`) or signing a request (see `28-authorization-header-creation`).

## Prerequisite

- An NP preparing to onboard, with access to the NP Portal (keys are generated in the portal for v1.1) or libsodium / Node.js `crypto`.

## Deliverable

A **signing key pair** (Ed25519) and an **encryption key pair** (X25519), plus a `unique_key_id` tying them to the subscriber.

## The two key pairs

| | Signing | Encryption |
|---|---|---|
| Algorithm | **Ed25519** | **X25519** |
| Public | `signing_public_key` (base64) | `encr_public_key` (ASN.1 DER → base64) |
| Private | `signing_private_key` (base64) | base64 |
| Used for | Sign the signing string + the onboarding `request_id` (**without hashing**) | Derive a shared key for the onboarding challenge / payload encryption |

## Guideline

1. Generate the **Ed25519** signing pair → `signing_public_key` / `signing_private_key`.
2. Generate the **X25519** encryption pair → public as **ASN.1 DER** then base64, private base64.
3. Assign a **`unique_key_id`** to the pair (identifies this key set in `keyId` and at lookup).
4. Register the public keys via onboarding (see `02`).

## Protocol nuances (why this is ONDC-peculiar)

- **Two distinct algorithms, two distinct jobs.** Ed25519 = signing; X25519 = encryption. They are not interchangeable, and swapping them is a common onboarding failure.
- **Encryption public key is ASN.1 DER-encoded** (then base64) — not raw bytes like the signing key.
- **Signing signs the string directly** — no pre-hash of the signing string (the digest step hashes the *body*, not the signing string; see `27` / `28`).
- **`unique_key_id` lets one NP hold multiple keys** — the basis for rotation (see `30`) and multiple subscriber types.

## Sources

- ONDC developer-docs `registry/Onboarding of Participants.md`
- ONDC reference-implementations `utilities/signing_and_verification`
