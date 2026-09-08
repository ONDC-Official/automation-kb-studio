# cancel / on_cancel (Protocol Lens)

## Objective

Explain **`cancel` / `on_cancel`** from a protocol lens — buyer/seller cancellation with reason codes — covering routing, handshake and correlation. Does NOT cover returns/part-cancel (see `23-update-on_update`) or the reason-code list itself (see `17-reason-codes`).

## Prerequisite

- A confirmed order (see `08`) and a valid cancellation **reason code** (see `17`).

## Deliverable

A cancelled order with the reason recorded, reflected in `on_cancel`.

## The action, in one line

`cancel` = a **cancellation request** carrying a reason code; `on_cancel` = the **updated (cancelled) order**. **Peer-to-peer** — no gateway.

## Guideline (the round trip)

1. **Initiator signs** `cancel` (order id + **reason code**) and POSTs **directly** to the counterparty.
2. **Receiver verifies**, returns synchronous **ACK/NACK**.
3. **Receiver sends** async **`on_cancel`** (cancelled order state) **directly** back, signed.
4. Correlate by `message_id` within the `transaction_id`.

## Protocol nuances (why this is ONDC-peculiar)

- **Reason code is mandatory** and drives refund/settlement — free-text won't do (see `17`).
- **Either side can initiate** — buyer or seller cancel; force-cancellation is a distinct, controlled path.
- **Cancel vs update.** Full cancellation is `cancel`; partial cancellation / returns go through `update` (see `23`).
- **Peer-to-peer, one header**; `transaction_id` continues.

## Sources

- ONDC-RET-Specifications (cancellation, reason codes); ONDC-Protocol-Specs core API contract
- ONDC developer-docs `protocol-network-extension`
