# Cancellation & Force Cancellation

## Objective

Explain buyer/seller **cancellation** and **force cancellation** with required reason codes. Does NOT cover returns (see `47`) or the reason-code list itself (see `17`).

## Prerequisite

- A confirmed order (see `08`) and a valid `cancellation_reason_id` (see `17`).

## Deliverable

A cancelled order with a valid reason, or a force-cancel where policy requires it.

## The idea, in one line

**Cancellation** is the normal `cancel` → `on_cancel` flow with a reason code; **force cancellation** is a controlled path (often system/seller-initiated) when the normal flow cannot complete.

## Guideline

1. **Cancel** — initiator sends `cancel` with `cancellation_reason_id` (see `22`, `17`).
2. **Force cancel** — used when the standard cancel is blocked; the reason is often system-assigned.
3. `on_cancel` returns the cancelled order; the reason drives refund/settlement.

## Protocol nuances (why this is ONDC-peculiar)

- **Reason code is mandatory** — missing `cancellation_reason_id` is a hard 400 (see `17`).
- **Force cancel is distinct** — a separate, controlled flow (the automation-specifications ship a dedicated `FORCE_CANCEL` flow), not the everyday cancel.
- **Policy can block cancellation** — e.g. TAT-not-breached rejects (error `60010`, see `15`).

## Sources

- ONDC-RET-Specifications; ONDC-Protocol-Specs docs (Cancellation)
- ONDC automation-specifications `config/flows/F&B/FORCE_CANCEL.yaml` (branch `draft-RET11-1.2.5`)
