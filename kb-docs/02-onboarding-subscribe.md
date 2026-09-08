# NP Onboarding (Subscribe v1.1)

## Objective

Explain how a Network Participant onboards onto ONDC and publishes its cryptographic credentials — the **Subscribe v1.1** process. **Subscribe v1.0 is deprecated; v1.1 is the active version.** Onboarding is portal-driven: keys are generated in the NP Portal and domain ownership is proven via **DNS** (Production only). Covers the challenge (encrypt/decrypt of `ondc-challenge`) as one step of this flow. Does NOT cover request signing (see `01-signature-verification`) or key resolution at runtime (see `03-lookup`).

## Prerequisite

- A valid **FQDN** to use as `subscriber_id`.
- A valid **SSL certificate** (for OCSP validation).
- Registration on the **Network Participant Portal** with an **Environment Access Request** to whitelist the `subscriber_id`.
- Key pairs generated **in the portal**: signing **Ed25519**, encryption **X25519 (ASN.1 DER)**.

## Deliverable

A registered NP whose public keys are discoverable in the registry, allowing it to transact and to be verified by counterparties.

## Guideline (Subscribe v1.1 flow)

1. **Portal onboarding** — register on the NP Portal, raise an Environment Access Request to whitelist the `subscriber_id`, and generate the Ed25519 + X25519 key pairs.
2. **Request ID** — the portal generates a **`request_id`** (UUID v4), the reference identifier for the subscription.
3. **DNS TXT verification — Production only.** Publish two records at the base-domain root:
   - **`ondc-signature`** = the `request_id` signed with the Ed25519 signing private key (without hashing).
   - **`ondc-challenge`** = the `request_id` encrypted with the NP's X25519 encryption private key + ONDC's public key (see Crypto detail below).
4. **Subscribe** — POST `/v1.1/subscribe` with `request_id`, `entity` (GST/PAN/contact), `key_pair` (public keys + validity), and `network_participant` (`subscriber_url`, `domain`, `type`).
5. **Registry validation** — schema, SSL OCSP, and (Production) DNS TXT check + **ONDC decrypts `ondc-challenge`** to confirm the NP holds the registered encryption key.

## Crypto detail (per registry encryption docs)

- **Shared key** — X25519 **Diffie-Hellman** between the NP's encryption **private** key and **ONDC's public** key (keys base64 / DER).
- **Cipher** — **AES-256-GCM** with a random **12-byte IV/nonce** and a **16-byte auth tag** (authenticated encryption).
- **Encoding** — the challenge value is **base64** (`iv + ciphertext + authTag`); the decrypted `request_id` is UTF-8.
- This is the same DH + AES-256-GCM scheme used for API payload encryption (see `09-payload-encryption-fis`); onboarding applies it to the `request_id` challenge.

## Environment difference (important)

- **Production** — the challenge is mandatory: the DNS TXT records (`ondc-signature` + `ondc-challenge`) must be published and are validated.
- **Pre-Prod** — **no DNS TXT records needed**; the **portal journey alone is enough** for a direct subscription. There is no challenge step to satisfy here.

## Protocol nuances (why this is ONDC-peculiar)

- **v1.1 changes vs v1.0:** DNS TXT validation replaces the old HTML site-verification; the `/on_subscribe` challenge-callback is gone (decryption is now ONDC-side); `ops_no` is deprecated (role is derived from `type`); the subscription schema is simplified.
- **Decryption is ONDC-side.** The NP only **encrypts** `request_id` into `ondc-challenge`; ONDC **decrypts** it to verify. The NP no longer hosts an endpoint to decrypt a pushed challenge.
- **Two different keys, easy to swap.** `ondc-signature` uses **Ed25519**; `ondc-challenge` uses **X25519**. Mixing them fails.
- **The ONDC public key is environment-specific** — using the wrong environment's key yields a wrong shared key and a failed challenge.

## Failure → effect

| Error | Meaning | Action |
|---|---|---|
| 137 | TXT record not found (Prod) | Verify `ondc-signature` and `ondc-challenge` TXT records are published |
| 123 | OCSP validation failed | Confirm SSL certificate validity/expiry |
| 135 / 136 | Signature or decryption failed | Ensure the keys in the request match those used to generate the DNS records |

## Sources

- ONDC developer-docs `registry/Onboarding of Participants.md`
- ONDC developer-docs `registry/encryption_and_decryption.md` (DH + AES-256-GCM scheme)
- ONDC developer-docs `registry/api_payload_encryption.md`
- ONDC-Registry-Specifications
