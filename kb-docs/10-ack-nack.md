# ACK / NACK Handshake

## Objective

Explain the **synchronous ACK/NACK response** returned for every ONDC API call — the immediate accept/reject that is separate from the later async `on_action` callback. Covers what ACK and NACK mean and when to NACK. Does NOT cover the async callback (see `11-async-request-callback`) or specific error codes (see `15-error-codes`).

## Prerequisite

- An inbound `action` request (`search`, `select`, `init`, `confirm`, …) or an `on_action` callback.
- The receiver can verify the signature and validate the payload before responding.

## Deliverable

An immediate, synchronous response to the caller: **ACK** (accepted for async processing) or **NACK** (rejected, with an error object).

## The handshake, in one line

Every call gets an **immediate synchronous response** — `ACK` if the message is accepted for processing, `NACK` if it is rejected. The actual business result comes **later**, asynchronously, in the `on_action` callback.

## Guideline

1. On receipt, verify the signature and validate `context` + schema.
2. If it passes, return **ACK** synchronously (`message.ack.status = "ACK"`) and continue processing asynchronously.
3. If it fails, return **NACK** (`message.ack.status = "NACK"`) with an **error object** (`error.code`, `error.type`, `error.message`).
4. Later, send the async `on_action` with the actual outcome.

## Protocol nuances (why this is ONDC-peculiar)

- **ACK ≠ success.** ACK means "accepted for processing," not "the request succeeded." The outcome arrives in the `on_action` callback. Treating ACK as a business success is a common mistake.
- **NACK carries an error object** — `code`, `type`, `message` — telling the caller why it was rejected (bad signature, schema error, unsupported domain/version, context error).
- **The handshake is per-hop.** Both the `action` request and its `on_action` callback each get their own synchronous ACK/NACK.
- **NACK stops the async flow** — a NACK means no `on_action` will follow for that message; ACK means one will.

## Sources

- ONDC developer-docs `protocol-network-extension`
- ONDC-Protocol-Specs core API contract (`protocol-specifications/core/v0/api/core.yaml`)
