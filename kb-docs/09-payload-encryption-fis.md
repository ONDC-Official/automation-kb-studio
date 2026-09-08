# Payload Encryption & Decryption (FIS)

## Objective

Explain ONDC's **API payload encryption** — encrypting the transaction `message` body between NPs, beyond the onboarding challenge. This is **currently active only for FIS (Financial Services)** domains (e.g. `ONDC:FIS…`) and **inactive for all other domains**. Covers payload encryption, the encrypt/decrypt scheme, and the form-encryption-and-signing variant. The onboarding challenge (see `02-onboarding-subscribe`) uses the same DH + AES-256-GCM scheme, applied to the `request_id` instead of the `message` body.

## Prerequisite

- Both NPs onboarded, each with an **X25519 encryption key pair** (`enc_private_key` / `enc_public_key`); the registry distributes each NP's `enc_public_key`.
- Ed25519 signing keys (for the form-signing variant).
- A domain where payload encryption is enabled (FIS today).

## Deliverable

A `message` body (or form) that is encrypted end-to-end between NP1 and NP2 so only the intended recipient can read it, while `context` stays in the clear for routing.

## Guideline — API payload encryption

**What is encrypted:** the entire **`message`** body, as one unit. **`context` stays plaintext** (needed for routing and audit).

**Encrypt (sender):**
1. Fetch the recipient's `enc_public_key` from the registry.
2. Derive the shared key: `diffieHellman(NP1_enc_private_key, NP2_enc_public_key)` (X25519).
3. Generate a random **12-byte IV**.
4. Encrypt with **AES-256-GCM** → ciphertext + 16-byte authTag.
5. Concatenate `iv + ciphertext + authTag`, **base64**-encode, and send as the `message` value.

**Decrypt (receiver):**
1. Base64-decode the `message` value.
2. Split: **IV (12 bytes)**, **authTag (16 bytes)**, ciphertext (remainder).
3. Derive the same shared key and run **AES-256-GCM** decrypt **with authTag verification**.
4. Parse the JSON and validate schema before ACK/NACK.

## Guideline — form encryption & signing (FIS forms)

1. Derive the shared key (X25519 DH, as above).
2. Generate a 12-byte nonce; encrypt the JSON-serialized form with **AES-256-GCM**.
3. Base64-encode ciphertext + authTag + nonce → package as **`encrypted_payload`**.
4. **Sign** the encrypted payload: **BLAKE-512** digest → signing string with timestamps + digest → **Ed25519** signature in the **`Authorization`** header (`Signature keyId=…`).
5. Transmit plaintext `context` + `encrypted_payload` in the body.
6. **Receiver:** verify the Ed25519 signature **first**, then derive the shared key and AES-256-GCM-decrypt using the carried nonce + authTag.

## Protocol nuances (why this is ONDC-peculiar)

- **FIS-only today.** The mechanism is defined network-wide but **currently active only for Financial Services**; other domains transact with plaintext `message`.
- **Same scheme as the onboarding challenge.** Both use X25519 DH + **AES-256-GCM** (12-byte IV/nonce + 16-byte authTag); onboarding applies it to the `request_id` challenge (see `02`), payload encryption to the `message` body.
- **`context` is never encrypted** — only `message` / the form is. Routing and audit rely on plaintext `context`.
- **Same X25519 keys throughout.** The `enc_private_key` / `enc_public_key` pair (from onboarding) is reused for payload/form encryption.
- **Encrypt-then-sign on forms.** Signature is computed over the encrypted payload and verified before decryption.

## Sources

- ONDC developer-docs `registry/api_payload_encryption.md`
- ONDC developer-docs `registry/encryption_and_decryption.md`
- ONDC developer-docs `registry/form_encryption_and_signing.md`
