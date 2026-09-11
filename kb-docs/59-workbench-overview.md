# Workbench — Overview & Access

## Objective

Explain what the **ONDC Protocol Workbench** is, how it's structured, and how to access it. Does NOT cover specific tool mechanics (see `60`, `61`, `65`).

## Prerequisite

- An NP building/testing an ONDC integration; a GitHub account (login is via GitHub).

## Deliverable

Access to the Workbench and an understanding of the tools it offers and the build→certify journey.

## What it is, in one line

The Workbench is ONDC's **"universal, intelligent framework to enable and facilitate the implementation of ONDC open network protocols"** — an all-in-one toolkit to **Validate, Debug, Deploy** an integration before go-live.

## Access

- Hosted at **`workbench.ondc.tech/home`**; **Login with GitHub**. Support: `PW-support@ondc.org`.
- Runnable locally via the `automation-framework` repo (Docker — see `62`).

## Navigation / tools

| Nav item | What it does |
|---|---|
| **Schema Validation** | Per-payload schema/type/enum checks (see `60`) |
| **Scenario Testing** | End-to-end NP-to-NP flow testing with a report (see `61`) |
| **Tools & SDK → Seller Onboarding** | Build a provider/catalog (domain, logo, provider name, descriptions, product images) |
| **Tools & SDK → Protocol Playground** | Configure/test flows — tabs **Tools · Flow Converter · Schema Generator**; *Load Saved* / *Import from GitHub*; fields Domain, Version, Flow ID, Use Case ID (`UCS-001`) |
| **Support** | Help / contact |

## The build → certify journey (the 3 steps on the home page)

1. **Validate Schemas** — per-payload checks (see `60`).
2. **Run Scenarios** — end-to-end testing (see `61`).
3. **Go Live** — production ready.

## Protocol nuances (why this is ONDC-peculiar)

- **One portal, several tools** — schema, scenario, seller-onboarding and a protocol playground under one login.
- **GitHub-centric** — login and flow import are via GitHub.
- **Hosted or local** — same toolkit runs from `automation-framework` locally (Docker).
- **Precedes go-live certification** — the Workbench is for building/debugging ahead of the separate certification step.

## Sources

- ONDC `automation-framework` (README); hosted `workbench.ondc.tech/home`
- Workbench UI (Home / Schema Validation / Scenario Testing / Tools & SDK)
