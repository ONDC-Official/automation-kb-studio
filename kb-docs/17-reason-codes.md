# Reason Codes (Cancel / Return)

## Objective

Explain the **business reason codes** used in cancellation and return flows — the authoritative enumerations that say *why* an order is cancelled or returned. Does NOT cover protocol error codes (see `15-error-codes`).

## Prerequisite

- A `cancel` / `update` (return) flow (see `22-cancel-on_cancel`, `23-update-on_update`).

## Deliverable

Cancel/return messages that carry a valid reason code so the counterparty (and settlement/grievance) can process them correctly.

## The idea, in one line

Reason codes are a **3-digit string enumeration** (e.g. `"001"`, `"002"`, `"016"`) carried in the cancel/return flow that identify the specific business reason; the field is `cancellation_reason_id`.

## The field (RET11, `config/attributes/F_B.yaml`)

- **`cancellation_reason_id`** — `type: string`, **required**, owner **BAP**. Example values seen in flows: `"001"`, `"002"`, `"006"`, `"016"`, `"052"`.
- The BAP sets it from the **buyer's explicit selection** in a buyer-initiated cancel, or from a **system-assigned** identifier in a **force-cancel**.
- **Absent → the cancel request is rejected with a 400** (mandatory to process).
- The value is **persisted and carried forward** so the BPP references it when composing `on_cancel`.

## The retail reason-code list (authoritative)

3-digit string codes; `Who` = initiator (BNP = buyer app, SNP = seller app, LSP = logistics); `Phase` = pre-/post-pickup:

| Code | Meaning | Who | Phase |
|---|---|---|---|
| 001 | Price of item(s) changed; buyer asked to pay more | BNP | Pre-pickup |
| 002 | One or more items not available (part-fill option; settles per last quote) | SNP | Either |
| 003 | Product available at lower than order price | BNP | Either |
| 004 / 051 | Store is not accepting order | BNP | Pre-pickup |
| 005 | Store rejected the order (may use 021–024) | SNP | Pre-pickup |
| 006 / 052 | Order not received per O2D TAT (timing breach by SNP) | BNP | Post-pickup |
| 009 | Wrong product delivered (settles per last quote) | BNP | Post-pickup |
| 010 / 053 | Buyer wants to modify address/order details | BNP | Pre-delivery |
| 011 | Retail buyer not found / uncontactable | SNP | Post-pickup |
| 013 | Buyer can't / won't accept delivery | SNP | Post-pickup |
| 014 | Delivery address incorrect or not found | SNP | Post-pickup |
| 016 | Force majeure (accident / strike / law & order) | SNP | Post-pickup |
| 017 | Order delivery delayed or not possible (vehicle/logistics) | LSP | Post-pickup |
| 018 | Order not serviceable | SNP | Post-pickup |
| 020 | Order lost or damaged in transit (cost to LSP) | SNP | Post-pickup |
| 021 | Store not responsive (auto-accepted, no response) | SNP | Pre-pickup |
| 022 | Technical issue in merchant device | SNP | Pre-pickup |
| 023 | Order received during non-operational hours | SNP | Pre-pickup |
| 024 | Order received during store rush | SNP | Pre-pickup |
| 998 | Order confirmation failure | SNP | Pre-pickup |
| 999 | Order confirmation failure | BNP | Pre-pickup |

Note the paired codes (`004/051`, `006/052`, `010/053`) — the newer 05x codes coexist with the legacy 3-digit ones.

## Guideline

1. On a `cancel` (or return `update`), set `cancellation_reason_id` from the table above — never free-text it.
2. Buyer-initiated → the buyer's selected code; force-cancel → a system-assigned code.
3. The code carries into `on_cancel` and feeds **settlement** and **grievance** handling, so it must be accurate.

## Protocol nuances (why this is ONDC-peculiar)

- **Reason codes (business) ≠ error codes (protocol).** Reason codes explain a business decision inside a valid flow; error codes explain a rejected/failed message. See `15`.
- **Mandatory and gating** — a missing `cancellation_reason_id` is a hard 400, not a soft warning.
- **Initiator matters** — buyer-selected vs system-assigned (force-cancel) use the same field with different sourcing.
- **Codes encode initiator + phase + effect** — the same field carries who raised it (BNP/SNP/LSP), when (pre-/post-pickup), and downstream impact (part-fill, RTO, settle-per-last-quote).
- **Legacy + new codes coexist** — `004/051`, `006/052`, `010/053` are equivalent pairs; accept both.

## Sources

- ONDC Retail Cancellation Reason Codes sheet (authoritative code list)
- ONDC automation-specifications `config/attributes/F_B.yaml` + `config/flows/F&B/*` (branch `draft-RET11-1.2.5`)
