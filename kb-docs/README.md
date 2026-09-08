# Protocol-Lens Docs

1-2 page docs for the network/protocol-peculiar topics from the 2026-08-31 plan — the nuances that are missing from the generic material. Every fact is stamped to an ONDC-Official GitHub source; payload-level specifics not yet confirmed are flagged for verification rather than invented.

These are the files to add to the ONDC common config, then build via the `kb-code` knowledge construct.

| # | Doc | Category | Status |
|---|---|---|---|
| 01 | [Signature Verification](01-signature-verification.md) | Security & Auth | source-confirmed |
| 02 | [NP Onboarding (Subscribe v1.1)](02-onboarding-subscribe.md) | Registry & Subscription | source-confirmed |
| 03 | [Lookup (/v2.0/lookup)](03-lookup.md) | Security & Auth | source-confirmed |
| 04 | [Registry Interaction](04-registry-interaction.md) | Registry & Subscription | source-confirmed |
| 05 | [Gateway Interaction](05-gateway-interaction.md) | Message Mechanics | source-confirmed |
| 06 | [P2P Communication](06-p2p-communication.md) | Message Mechanics | source-confirmed |
| 07 | [search / on_search](07-search-on_search.md) | API Actions | source-confirmed (routing; payloads in 36–48) |
| 08 | [confirm / on_confirm](08-confirm-on_confirm.md) | API Actions | source-confirmed (routing; payloads in 36–48) |
| 09 | [Payload Encryption & Decryption (FIS)](09-payload-encryption-fis.md) | Security & Auth | source-confirmed (FIS-only) |
| 10 | [ACK / NACK Handshake](10-ack-nack.md) | Message Mechanics | source-confirmed |
| 11 | [Async Request → Callback Pattern](11-async-request-callback.md) | Message Mechanics | source-confirmed |
| 12 | [TTL Handling](12-ttl-handling.md) | Message Mechanics | source-confirmed |
| 13 | [Idempotency & Retries](13-idempotency-retries.md) | Message Mechanics | source-confirmed |
| 14 | [Schema Validation](14-schema-validation.md) | Message Mechanics | source-confirmed |
| 15 | [Error Codes (x-errorcodes)](15-error-codes.md) | Errors & Codes | source-confirmed (RET11) |
| 16 | [Validation Rules (x-validations)](16-validation-rules.md) | Errors & Codes | source-confirmed (RET11) |
| 17 | [Reason Codes (Cancel / Return)](17-reason-codes.md) | Errors & Codes | source-confirmed (RET11) |
| 18 | [API Action Catalogue & Lifecycle](18-action-catalogue-lifecycle.md) | API Actions | source-confirmed |
| 19 | [select / on_select](19-select-on_select.md) | API Actions | source-confirmed (routing; payloads in 36–48) |
| 20 | [init / on_init](20-init-on_init.md) | API Actions | source-confirmed (routing; payloads in 36–48) |
| 21 | [status / on_status](21-status-on_status.md) | API Actions | source-confirmed (routing; payloads in 36–48) |
| 22 | [cancel / on_cancel](22-cancel-on_cancel.md) | API Actions | source-confirmed (routing; payloads in 36–48) |
| 23 | [update / on_update](23-update-on_update.md) | API Actions | source-confirmed (routing; payloads in 36–48) |
| 24 | [track / on_track](24-track-on_track.md) | API Actions | source-confirmed (routing; payloads in 36–48) |
| 25 | [rating / support](25-rating-support.md) | API Actions | source-confirmed (routing; payloads in 36–48) |
| 26 | [Key Generation](26-key-generation.md) | Security & Auth | source-confirmed |
| 27 | [Digest Generation — BLAKE-512](27-digest-generation.md) | Security & Auth | source-confirmed |
| 28 | [Authorization Header Creation](28-authorization-header-creation.md) | Security & Auth | source-confirmed |
| 29 | [Registry Caching of Public Keys](29-registry-caching.md) | Security & Auth | source-confirmed |
| 30 | [Key Rotation](30-key-rotation.md) | Security & Auth | source-confirmed |
| 31 | [GCR — Global Catalog Repository](31-gcr-global-catalog-repository.md) | Catalog & Discovery | source-confirmed (GCR PRD) |
| 32 | [Environment Matrix — Pre-Prod / Prod](32-environment-matrix.md) | Network Policy | source-confirmed |
| 33 | [Domain & Version Enablement](33-domain-version-enablement.md) | Network Policy | source-confirmed |
| 34 | [transaction_id](34-transaction-id.md) | Message Mechanics | source-confirmed |
| 35 | [message_id](35-message-id.md) | Message Mechanics | source-confirmed |
| 36 | [Catalog Object Model](36-catalog-object-model.md) | Catalog & Discovery | source-confirmed (RET11) |
| 37 | [Full vs Incremental Catalog Refresh](37-catalog-refresh.md) | Catalog & Discovery | source-confirmed (RET11) |
| 38 | [Item Variants & Customizations](38-item-variants-customizations.md) | Catalog & Discovery | source-confirmed (RET11) |
| 39 | [Serviceability (geo / pincode / radius)](39-serviceability.md) | Catalog & Discovery | source-confirmed (RET11) |
| 40 | [Catalog & Store Rejection Framework](40-catalog-store-rejection.md) | Catalog & Discovery | source-confirmed (GCR + spec) |
| 41 | [Static Terms](41-static-terms.md) | Catalog & Discovery | source-confirmed (repo) |
| 42 | [Taxonomy & Category / Domain Codes](42-taxonomy-codes.md) | Catalog & Discovery | source-confirmed (Taxonomy v1.2) |
| 43 | [Quote & Price Breakup](43-quote-price-breakup.md) | Order Lifecycle | source-confirmed (RET11) |
| 44 | [Order State Machine](44-order-state-machine.md) | Order Lifecycle | source-confirmed (RET11) |
| 45 | [Payment Terms (collector, prepaid/COD)](45-payment-terms.md) | Order Lifecycle | source-confirmed (RET11) |
| 46 | [Cancellation & Force Cancellation](46-cancellation-force-cancellation.md) | Order Lifecycle | source-confirmed (RET11) |
| 47 | [Returns, RTO & RTS](47-returns-rto-rts.md) | Order Lifecycle | source-confirmed (RET11) |
| 48 | [Fulfillment States & TAT](48-fulfillment-states-tat.md) | Order Lifecycle | source-confirmed (RET11) |
| 49 | [Logistics Linkage (retail ↔ LSP)](49-logistics-linkage.md) | Fulfillment & Logistics | source-confirmed (LOG11) |
| 50 | [Fulfillment Types](50-fulfillment-types.md) | Fulfillment & Logistics | source-confirmed (RET11) |
| 51 | [AWB & Shipping Label Handling](51-awb-shipping-label.md) | Fulfillment & Logistics | source-confirmed (LOG11) |
| 59 | [Workbench — Overview & Access](59-workbench-overview.md) | Workbench & Testing | source-confirmed (UI + repo) |
| 60 | [Schema Validation Tool — Usage](60-schema-validation-tool.md) | Workbench & Testing | source-confirmed (UI + repo) |
| 61 | [Flow / Scenario Testing — Usage](61-flow-testing-suite.md) | Workbench & Testing | source-confirmed (UI + repo) |
| 62 | [Workbench — Local Setup (Docker)](62-workbench-local-setup.md) | Workbench & Testing | source-confirmed (repo) |
| 63 | [Mock Server / Sandbox Usage](63-mock-server-sandbox.md) | Workbench & Testing | source-confirmed (repo) |
| 65 | [Interpreting Validation Error Reports](65-interpreting-error-reports.md) | Workbench & Testing | source-confirmed (JVAL) |

> RSF (52–55), IGM (56–58) and Pramaan (64) were removed as out of scope (2026-09-09); those numbers are retired.
| 66 | [Network Observability API](66-network-observability-api.md) | Observability & Ops | source-confirmed (NO schema) |
| 67 | [Versioning & Spec Migration](67-versioning-spec-migration.md) | Observability & Ops | overview (no further source) |
| 68 | [Release Calendar & Change Management](68-release-calendar.md) | Observability & Ops | overview (no further source) |
| 69 | [City & State Codes Usage](69-city-state-codes.md) | Observability & Ops | source-confirmed (std format) |
| 70 | [Async Implementation Skill](70-async-implementation-skill.md) | Engineering Skills | partial |
| 71 | [Signature Verification Skill (Code)](71-signature-verification-skill.md) | Engineering Skills | partial |
