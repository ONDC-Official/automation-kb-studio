# Signature Verification

## Objective

Explain how a receiving Network Participant (NP) **verifies the authenticity of an inbound request** on the ONDC network — the exact steps, the header it parses, the string it reconstructs, and when it must reject. Does NOT cover how the sender builds the signature (see `28-authorization-header-creation`) or key generation (see `26`).

## Prerequisite

- The request carries an `Authorization` header (and an `X-Gateway-Authorization` header when routed via the Beckn Gateway).
- The receiver can reach the registry `/v2.0/lookup` (see `03`) or a valid public-key cache (see `29`).
- Signing keys are **Ed25519**; the digest is **BLAKE-512** over the request body.

## Deliverable

A receiver-side verification path that returns **ACK** on a valid signature and **NACK (Unauthorised)** on any failure, applied to the originator header and — on gateway-routed calls — the gateway header too.

## Guideline (verification steps — from the ONDC spec)

1. **Extract `keyId`** from the `Authorization` (or `X-Gateway-Authorization`) header.
2. **Split `keyId`** on the pipe `|` → `subscriber_id`, `unique_key_id`, `algorithm`.
3. **Algorithm check** — if the split algorithm ≠ the header's `algorithm` param → **NACK** (enforced by the receiver).
4. **Fetch the public key** — query the registry `/v2.0/lookup` by `subscriber_id` + `unique_key_id`, or use the cache. No valid key → **NACK Unauthorised**.
5. **Reconstruct the signing string** from the header's `created` / `expires` and the recomputed body `digest`.
6. **Verify** the base64-decoded **Ed25519** signature against the reconstructed signing string.
7. **Validity window** — reject if `created` is in the future or `expires` is in the past (see rules below).
8. **Gateway-routed** — repeat 1–7 for `X-Gateway-Authorization`; **both** must pass.

## The Authorization header (what you parse)

```
Signature keyId="buyer-app.ondc.org|207|ed25519",algorithm="ed25519",created="1641287875",expires="1641291475",headers="(created) (expires) digest",signature="fKQWvXhln4UdyZdL87ViXQObdBme0dHnsclD2LvvnHoNxIgcvAwUZOmwAnH5QKi9Upg5tRaxpoGhCFGHD+d+Bw=="
```

- **`keyId`** = `{subscriber_id}|{unique_key_id}|{algorithm}` → e.g. `buyer-app.ondc.org` · `207` · `ed25519`. The `unique_key_id` lets one domain run multiple subscriber types / multiple registered keys (see `30`).
- **`created` / `expires`** = Unix timestamps. **`headers`** = `"(created) (expires) digest"` (spaces between the three, single-space) — this spaced form is the authoritative byte form (see nuances). **`signature`** = base64 Ed25519.

## The signing string (what you reconstruct)

Three `\n`-separated lines, byte-exact:

```
(created): 1641287875
(expires): 1641291475
digest: BLAKE-512=b6lf6lRgOweajukcvcLsagQ2T60+85kRh/Rd2bdS+TG/5ALebOEgDJfyCrre/1+BMu5nA94o4DT3pTFXuUg7sw==
```

The **`digest`** is **BLAKE-512 over the complete JSON request body**, base64-encoded. Example: the body

```json
{"context":{"domain":"nic2004:60212","country":"IND","city":"Kochi","action":"search",...},
 "message":{"intent":{"fulfillment":{"start":{"location":{"gps":"10.108768, 76.347517"}}, ...}}}}
```

hashes to the `BLAKE-512=b6lf6lRg…7sw==` digest above. Recompute it over the **received** bytes and compare — see `27` for the byte-exact rule.

## Validity window (exact rules)

- A signature whose **`created` is in the past MUST be processed** → reject only if `created` is in the **future**.
- A signature whose **`expires` is in the future MUST be processed** → reject only if `expires` is in the **past** (expired).
- The spec defines **no absolute drift / clock-skew tolerance** (so no separate open question on skew).

## Gateway-routed requests (two signatures)

1. NP1 builds `Authorization` and sends to the **BG**.
2. BG **verifies** NP1's `Authorization`.
3. BG builds its own **`X-Gateway-Authorization`** with the BG private key.
4. BG **forwards** to NP2 carrying **both** headers.
5. NP2 **verifies both** — same algorithm, identical header format, different signer (see `05`).

## Failure → response

| Failure | Response |
|---|---|
| keyId/algorithm mismatch | NACK Unauthorised |
| No public key found | NACK Unauthorised |
| Signature does not verify | NACK Unauthorised |
| `created` in the future / `expires` in the past | NACK (invalid window) |

> The spec mandates a **NACK with Unauthorised** on failure but does **not** define the exact error JSON payload/HTTP mapping.

## Protocol nuances (why this is ONDC-peculiar)

- **Digest is byte-exact over the payload as-passed** — no canonicalization before hashing; re-serializing breaks it (see `27`).
- **Two signatures on gateway hops** — verify both `Authorization` and `X-Gateway-Authorization` independently.
- **Signing-string spacing — use the spaced form.** Production verifiers accept the **spaced** byte form: signing string `(created): <ts>\n(expires): <ts>\ndigest: BLAKE-512=<b64>` and `headers="(created) (expires) digest"` (single spaces). The older no-space registry-doc form (` (created)(expires)digest`) is wrong. A byte difference here fails an otherwise-valid signature (see `28`).

## Sources

- ONDC developer-docs `registry/signing-verification.md`
- ONDC `ondc-crypto-sdk-go` (code-confirmed byte-exact digest + signing-string spacing discrepancy)
