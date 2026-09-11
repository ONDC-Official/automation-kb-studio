# Mock Service / Sandbox Usage

## Objective

Explain using the **mock counterparty** (Mock Service + Domain API Services) to test your side in isolation. Does NOT cover production traffic.

## Prerequisite

- Your NP (BAP or BPP) under development; the Workbench (hosted or local — see `62`).

## Deliverable

Your side exercised against a mock counterparty without a live partner.

## What it is, in one line

The **Mock Service & Domain API Services** simulate the **counterparty** NP (and its domain behaviour) so you can test your side alone across domains (e.g. `RET10`, `FIS12`, `TRV11`).

## Guideline

1. Point your NP at the mock service as its counterparty (local port **3031**, or via the hosted Workbench).
2. Send actions; the mock returns protocol-correct `on_action` callbacks.
3. Validate your ACK/NACK + callback handling (see `10`, `11`).

## Protocol nuances (why this is ONDC-peculiar)

- **Domain-aware mock** — the Domain API Services are generated per domain/version from the specs (see `62`), so the mock behaves like a real NP in that domain.
- **Isolation testing** — no live partner needed; deterministic.
- **Not production** — mock responses are for development, not certification or live traffic.

## Sources

- ONDC `automation-mock-service`
- ONDC `automation-framework` (Mock Service & Domain API Services)
