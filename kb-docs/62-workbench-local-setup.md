# Workbench — Local Setup (Docker)

## Objective

Explain running the Workbench and a domain API service **locally** via Docker. Does NOT cover the hosted portal (see `59`).

## Prerequisite

- **Docker, Docker Compose, and Git** installed.

## Deliverable

A locally running Workbench (UI + backend + mock + domain API service) for offline testing.

## Guideline (real setup, from the repo)

```bash
git clone <automation-framework repo>
cd automation-framework
git submodule update --init            # pulls the specs/services submodules

docker compose build ui-frontend backoffice-frontend
docker compose up -d
```

## Services & ports

| Service | Port |
|---|---|
| UI Frontend | 3035 |
| UI Backend | 3034 |
| Domain API Service | 3032 |
| Mock Service | 3031 |
| DB Service | 5001 |

- **Domain API services are generated from spec branches** by `build-api-service.sh` — it clones the specs locally and generates Docker-composable services per domain/version.

## Protocol nuances (why this is ONDC-peculiar)

- **Submodules matter** — `git submodule update --init` pulls the specs/services; skipping it breaks the build.
- **Domain services are code-generated** from the `automation-specifications` branches (same config the hosted Workbench uses — see `16`, `61`).
- **Local mirrors hosted** — same tools as `workbench.ondc.tech`, offline.

## Sources

- ONDC `automation-framework` (README — local development setup, `build-api-service.sh`)
