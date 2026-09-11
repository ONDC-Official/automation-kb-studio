# Release Calendar & Change Management

## Objective

Explain ONDC's **release cadence** and how updates ship. Does NOT cover version internals (see `67`).

## Prerequisite

- An integration that must stay current with releases.

## Deliverable

Awareness of when changes land so you can plan migrations.

## The idea, in one line

ONDC ships on a **regular cadence** — minor releases mid-month (~15th) and major releases around end-of-month — announced via the release calendar.

## Guideline

1. Track the release calendar for your domain.
2. Treat **minor** (~15th) releases as incremental; **major** (end-of-month) as larger contract changes.
3. Plan migration (see `67`) around the calendar.

## Protocol nuances (why this is ONDC-peculiar)

- **Predictable cadence** — minor ~15th, major ~end-of-month; plan around it rather than reacting.
- **Calendar is authoritative** for timing; the version branches carry the actual changes.

## Sources

- ONDC developer-docs (Release Calendar)
