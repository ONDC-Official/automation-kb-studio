# Environment Matrix — Pre-Prod / Prod

## Objective

State the ONDC **environments** and their gateway/registry endpoints and behavioural differences. Does NOT cover onboarding steps (see `02`).

## Prerequisite

- Knowing which environment you are targeting.

## The environments

**Two live environments: Pre-Prod and Prod. Staging is deprecated.**

| | Registry (lookup 2.0) | Gateway |
|---|---|---|
| Pre-Prod | `https://preprod.registry.ondc.org/v2.0/lookup` | `https://preprod.gateway.ondc.org/search` |
| Production | `https://prod.registry.ondc.org/v2.0/lookup` | `https://prod.gateway.ondc.org/search` |

## Behavioural differences

- **DNS challenge is Production-only.** Pre-Prod subscribes directly via the portal journey; Prod additionally requires the `ondc-signature` + `ondc-challenge` DNS TXT records (see `02`).
- **Isolation.** Each environment is a separate registry host; a subscriber in one is not visible in the other.
- **No `/ondc/` path prefix** on lookup 2.0 in either environment.

## Guideline

1. Pick endpoints by environment from the table above.
2. In Pre-Prod, complete onboarding via the portal only; in Prod, also publish the DNS TXT records.
3. Never mix environment keys/hosts — the ONDC public key and hosts differ per environment.

## Protocol nuances (why this is ONDC-peculiar)

- **Staging is gone** — only Pre-Prod and Prod remain; older docs listing three environments are stale.
- **Endpoints are time-bound** — verify against the ONDC-Official "Gateway and Registry Endpoints" list before use.

## Sources

- ONDC-Official profile README — Gateway and Registry Endpoints
- ONDC developer-docs `registry/Onboarding of Participants.md`
