# Error Codes (x-errorcodes)

## Objective

Explain the **enumerated protocol error codes** returned in a NACK's error object, and how they're categorized. Does NOT cover business reason codes for cancel/return (see `17-reason-codes`) or cross-field validations (see `16-validation-rules`).

## Prerequisite

- The ACK/NACK handshake (see `10`) — errors ride on a NACK.

## Deliverable

Correct NACK responses that carry the right error `code` + `type` so the caller can act on the failure.

## The error object

An error is returned as a `code` plus a descriptive event, carried either **in a NACK** (rejecting the message) or **in an `error` object inside an `on_` callback** (business error on an accepted message). Each entry in `errors/index.yaml` records: `code`, `Event` (what it means), `From` (BAP or BPP), and where it's used (NACK vs error object).

## Actual code structure (RET, `draft-RET11-1.2.5`)

Codes are **5-digit strings** in the `6xxxx` space, grouped by originator and concern. Representative set from `config/errors/index.yaml`:

| Code | From | Meaning | Used in |
|---|---|---|---|
| 60005 | BPP | Invalid Signature — cannot verify request signature | **NACK** |
| 60006 | BPP | Invalid request — not compliant with API contract | **NACK** |
| 60001 / 60002 | BPP | Location serviceability (pickup / dropoff not serviceable) | error object |
| 60004 | BPP | Delivery partners not available | error object |
| 60007 / 60009 / 60010 | BPP | Cancellation policy / invalid reason / TAT-not-breached | — |
| 60012 | BPP | Tracking not enabled | — |
| 61001 / 64001 | BPP / BAP | Feature not supported | — |
| 625xx | BAP | Terms / quote / authorization errors (e.g. 62508 quote difference, 62510 expired auth) | — |
| 63001 / 63002 | BAP | Internal error / order validation failure | — |
| 65001–65004 | BPP | Order confirm / terms / stale request | — |
| 66001–66005 | BPP | Internal / order validation / not found / quote unavailable | — |

## Guideline

1. On a failure, pick the enumerated `code` from `errors/index.yaml` for the domain/version.
2. If the message itself is rejected (bad signature `60005`, non-compliant `60006`), return it in a **NACK**.
3. If the message is accepted but a business error occurs, return the `code` in the **`error` object of the `on_` callback**.

## Protocol nuances (why this is ONDC-peculiar)

- **Protocol/NACK codes ≠ business reason codes.** Error codes describe *why a message was rejected or failed*; cancel/return reason codes describe *a business decision* (see `17`). Keep them separate.
- **Codes are per domain + version.** These `6xxxx` codes are the RET set (`draft-RET11-1.2.5`); other domains (FIS, LOG, TRV) ship their own `errors/index.yaml` on their branch.
- **Two placements.** The same registry drives both NACK rejections and in-callback error objects — the `Used in` field tells you which.
- **Don't invent codes** — read them from `errors/index.yaml` on the target branch.

## Sources

- ONDC automation-specifications `config/errors/index.yaml` (branch `draft-RET11-1.2.5`)
- ONDC-Protocol-Specs docs (Error Codes)
