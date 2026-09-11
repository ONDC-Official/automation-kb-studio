# Versioning & Spec Migration

## Objective

Explain reading **version bumps** and migrating between contract versions. Does NOT cover release dates (see `68`).

## Prerequisite

- A live integration on a given `core_version`.

## Deliverable

A migration from one contract version to the next with schema/validation changes applied.

## The idea, in one line

ONDC contracts are **versioned** (`core_version`, and per-domain-version branches like `draft-RET11-1.2.5`); migrating means adopting the new schema, validations and error/action changes for that version.

## Guideline

1. Track the target `core_version` for your domain.
2. Diff the new version's `automation-specifications` config (schema, validations, actions, errors) against your current one.
3. Update payloads/handlers, re-run Workbench (see `61`), then cut over.

## Protocol nuances (why this is ONDC-peculiar)

- **Version = branch.** The authoritative config for each version is a dedicated branch; migrate by diffing branches.
- **Multiple things move together** — schema, `x-validations`, error codes and action transitions can all change across a version.
- **Set `context.core_version` correctly** — it selects the contract (see `33`).

## Sources

- ONDC `automation-specifications` (per-version branches; `config/docs/release-notes.md`)
