# Flow / Scenario Testing — Usage

## Objective

Explain running **end-to-end simulated NP-to-NP flows** in the Workbench (the "Scenario Testing" tool). Does NOT cover single-payload checks (see `60`).

## Prerequisite

- A working, reachable NP endpoint (subscriber URL) to drive through a flow.
- Pop-ups allowed in the browser (required to open the report tabs).

## Deliverable

A use-case flow run to completion, producing a report you can view, download and share.

## What it is, in one line

Scenario Testing runs a **whole use-case sequence** against your NP — checking each step's payload, validations and transitions — and generates a certification-style report.

## Guideline (the 9 steps / session setup)

Create a new **Session** ("fill the details to begin flow testing"), or *Create profile config*:

1. **Enter Subscriber URL** (e.g. `https://example.com`).
2. **Select Domain**.
3. **Select Version**.
4. **Select Usecase**.
5. **Select Your Role** (e.g. Buyer App (BAP) / Seller App (BPP)).
6. **Select Environment** (e.g. **PRE-PRODUCTION**).
7. **Generate Report**.
8. **View Report**.
9. **Download / Share Report**.

## Protocol nuances (why this is ONDC-peculiar)

- **Sequence-aware.** Unlike the schema tool, it enforces action ordering (see `18`) and cross-field `x-validations` (see `16`) across the flow.
- **Role + environment scoped** — you test as a specific role (BAP/BPP) against a chosen environment (Pre-Prod).
- **Flows come from versioned config** — the use-cases map to `automation-specifications` `config/flows` on the domain branch (tagged WORKBENCH / MANDATORY / REPORTABLE).
- **Mock counterparty** — a Mock Service + Domain API Services simulate the other NP (see `63`).
- **Pop-ups required** — reports open in new tabs.

## Sources

- ONDC `automation-framework` (Core Tools — Flow Testing Suite)
- ONDC automation-specifications `config/flows/index.yaml` (branch `draft-RET11-1.2.5`)
- Workbench UI (Scenario Testing) — `workbench.ondc.tech/scenario`
