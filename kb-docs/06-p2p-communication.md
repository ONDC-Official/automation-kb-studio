# P2P Communication (Peer-to-Peer NP ↔ NP)

## Objective

Explain how NPs talk **directly to each other** (BAP ↔ BPP) for every action after discovery, and how this differs from the gateway-routed `search`. Frames the "who signs, who verifies, where does the reply go" of peer-to-peer calls. Does NOT cover the gateway hop (see `05-gateway-interaction`).

## Prerequisite

- Both NPs are registered; each can resolve the other's public key via `/lookup`.
- `context.bap_uri` and `context.bpp_uri` are known (established during discovery).

## Deliverable

A direct, signed action → on_action exchange between two NPs with no intermediary.

## The rule, in one line

**Only the `search` request goes through the gateway; everything else is peer-to-peer.** The buyer sends `search` to the gateway, the gateway broadcasts it to all valid sellers, and each seller sends `on_search` **directly back to the buyer** (not through the gateway). From `select` onward — select, init, confirm, status, track, cancel, update, rating, support and all their `on_` callbacks — the BAP and BPP call each other directly. So `on_search` is already a direct call; the gateway touches only the outbound `search`.

## Guideline (a peer-to-peer action)

1. Sender signs the request with its own key → **only** the `Authorization` header travels (no `X-Gateway-Authorization`).
2. Sender POSTs directly to the counterparty's URI (`bpp_uri` for BAP→BPP, `bap_uri` for the callback).
3. Receiver verifies the single `Authorization` header (resolve key via `/lookup`).
4. Receiver returns a synchronous **ACK / NACK**, then later sends the async **`on_action`** callback to the sender's URI.

## Protocol nuances (why this is ONDC-peculiar)

- **One header, not two.** Peer-to-peer calls skip the BG, so only the originator's `Authorization` is present — there is no gateway signature to verify.
- **Both directions are signed calls.** The `on_action` callback is itself a signed request from the BPP to the BAP's `bap_uri`; the BAP verifies it the same way.
- **Routing is by URI in `context`.** `bap_uri` / `bpp_uri` (same domain as their respective ids) determine where each message goes — there is no central router on this path.
- **Correlation is by `message_id`** (shared between a request and its `on_` callback) within a `transaction_id` journey.

## Sources

- ONDC developer-docs `registry/signing-verification.md`
- ONDC developer-docs `protocol-network-extension`
