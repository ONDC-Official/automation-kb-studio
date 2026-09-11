# API Action Catalogue & Lifecycle

## Objective

Index **every ONDC action and its `on_` callback**, and the order they fire across an order journey. A map, not a payload spec. Does NOT detail each payload (see the per-action docs).

## Prerequisite

- The async `action` → `on_action` model (see `11`) and ACK/NACK (see `10`).

## Deliverable

A single view of the actions, their callbacks, and the typical sequence.

## The lifecycle, in order

| Phase | Action → callback | Routing |
|---|---|---|
| Discovery | `search` → `on_search` | `search` via gateway; `on_search` direct (see `07`) |
| Cart / quote | `select` → `on_select` | peer-to-peer (see `19`) |
| Order draft | `init` → `on_init` | peer-to-peer (see `20`) |
| Order placement | `confirm` → `on_confirm` | peer-to-peer (see `08`) |
| Order state | `status` → `on_status` | peer-to-peer (see `21`) |
| Tracking | `track` → `on_track` | peer-to-peer (see `24`) |
| Cancellation | `cancel` → `on_cancel` | peer-to-peer (see `22`) |
| Post-order change | `update` → `on_update` | peer-to-peer (see `23`) |
| Feedback / help | `rating` → `on_rating`, `support` → `on_support` | peer-to-peer (see `25`) |

## Allowed transitions (`config/actions/index.yaml`, RET11)

The config encodes a **state machine** (`supportedActions`: what may legally follow each action) and **`apiProperties`** (`async_predecessor`, `transaction_partner`). Key facts read from it:

- `search → on_search`; `on_search →` `search` / `select` / `init`.
- `select → on_select`; `on_select →` `init` / `select`.
- `init → on_init`; `on_init →` `confirm` / `init`.
- `confirm → on_confirm`; `on_confirm →` `status` / `cancel` / `track` / `update` / `on_status` …
- Post-order: `status ↔ on_status`, `track ↔ on_track`, `cancel ↔ on_cancel`, `update ↔ on_update`, plus **`issue` / `on_issue` / `on_issue_status`** (IGM).
- **`async_predecessor`** — e.g. `on_select.async_predecessor = select`, `on_init = init`, `on_confirm = confirm` (each callback is bound to its request).
- **`transaction_partner`** — e.g. `confirm` and post-order actions carry `init` / `on_init` / `confirm` as partners, tying them to the order.

## Guideline

1. Every action follows the same shape: **`action` → synchronous ACK → async `on_action`**.
2. **Only `search` uses the gateway**; every other action (and `on_search`) is peer-to-peer.
3. **`transaction_id`** stays constant across the whole journey; **`message_id`** pairs each action with its callback (`async_predecessor` links the pair in config).
4. Follow only the transitions in `supportedActions` — an out-of-sequence action is invalid.

## Protocol nuances (why this is ONDC-peculiar)

- **Uniform shape, one exception.** All actions share the request→ACK→callback pattern; the only routing exception is the outbound `search` through the gateway.
- **Legal-transition set is explicit.** `supportedActions` defines exactly what may follow each action — it's a state machine, not a free-for-all.
- **IGM is part of the same graph.** `issue` / `on_issue` / `on_issue_status` are reachable from `on_confirm` / `on_status` / `on_update`.
- **Callbacks are separate signed calls**, correlated by `message_id` and bound via `async_predecessor`.

## Sources

- ONDC automation-specifications `config/actions/index.yaml` (branch `draft-RET11-1.2.5`)
- ONDC developer-docs `protocol-network-extension`; ONDC-Protocol-Specs core API contract
