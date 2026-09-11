# Order State Machine

## Objective

Explain the valid **order / fulfillment state transitions**. Does NOT cover payment states (see `45`).

## Prerequisite

- A confirmed order (see `08`).

## Deliverable

Order and fulfillment states that only move along allowed transitions.

## The idea, in one line

An order has an **order state** and each **fulfillment** has its own state; both advance only through defined transitions, surfaced via `on_status` / `on_update`.

## Real states (RET11)

- **Fulfillment state** (delivery milestones, in order): **Pending → Packed → Agent-assigned → Order-picked-up → Out-for-delivery → Order-delivered**; terminal **Cancelled**. The BPP rebuilds the fulfillment state array at each milestone. RTO / partial-cancel legs are appended as separate `Cancel`-type fulfillment entries.
- **Order state:** advances to terminal **Completed** or **Cancelled** (`on_cancel` sets `Cancelled`). The BAP validator asserts the returned state is a recognized post-action value.
- **Payment state:** **Pending → Paid** (declared by the BPP from `on_init` onward, carried verbatim into `confirm`).

## Guideline

1. Set `order.state` and each `fulfillment.state` from the allowed enum.
2. Advance only along valid transitions; report changes via `on_status` (see `21`).
3. Terminal states (Completed, Cancelled) end the lifecycle.

## Protocol nuances (why this is ONDC-peculiar)

- **Two levels of state** — order-level and fulfillment-level, which move semi-independently.
- **Transitions are constrained** — see the action state machine in `config/actions/index.yaml` (`supportedActions`) for which actions are valid at each point (`18`).
- **State ≠ location** — tracking coordinates are `track` (see `24`), not a state value.

## Sources

- ONDC-RET-Specifications; ONDC-Protocol-Specs core API contract
- ONDC automation-specifications `config/actions/index.yaml` (branch `draft-RET11-1.2.5`)
