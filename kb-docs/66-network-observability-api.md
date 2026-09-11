# Network Observability API (Production)

## Objective

Explain the **Network Observability (NO)** API — the schema and process by which NPs push transaction logs to ONDC for production observability. Does NOT cover internal application logging.

## Prerequisite

- Subscribed to the **Production Registry**.
- A **bearer token** generated from the NP Portal (Configuration Settings).

## Deliverable

An **automated** feed of transaction logs (requests + responses + ACK/NACK) pushed to the NO API in the mandated schema.

## What NO is, in one line

Network Observability is an ONDC **framework to observe the business and technical health of the network** — improving interoperability, transparency and trust and enabling NPs to self-correct. It is **policy-mandatory** (per the ONDC Network Observability notification, 14 Jun 2023).

## Bearer token

- An **authorization identifier** linked to a **`subscriber_id` + NP type**, and **domain-agnostic**.
- **One token per (subscriber_id + NP type)** — an NP that is both a Buyer NP and a Seller NP (or has multiple subscriber_ids) has **multiple tokens**.
- Generated from the **NP Portal → Configuration Settings** after Prod Registry subscription; **valid only for the Prod stage** (Pre-Prod has its own schema/token — see the Pre-Prod schema doc).

## Endpoint

```
POST https://analytics-api.aws.ondc.org/v1/api/push-txn-logs
Authorization: Bearer <token>
```

## What & when to share

- The **transaction JSON from `on_search` onwards** — **both request and response** for each action (`on_search`, `select`, `on_select`, `init`, `on_init`, …), **including the IGM APIs** (`issue`, `on_issue`, `issue_status`, `on_issue_status`), plus **every ACK and NACK**.
- Also share **unsolicited calls** received/sent.
- Must be an **automated push** from the NP — **not** manual Postman submission.
- **Anonymize PII** in each API; **City and Pincode are NOT to be anonymized**.

## Push schema

Each log wraps the actual transaction:

```json
{
  "type": "init",              // the action (init / on_init / issue / … ); flag ACK/NACK where applicable
  "data": {
    "context": { "action": "init", "domain": "…", "bap_id": "…", "bpp_id": "…", "transaction_id": "…", "message_id": "…", "timestamp": "…", "ttl": "…", "core_version": "…", "city": "std:080", "country": "IND" },
    "message": { "order": { … } }
  }
}
```

- **`type`** = the action name (and whether the entry is an ACK/NACK); **`data`** = the real `context` + `message` of that call.
- Covers Retail, Logistics, Financial Services, Gift Cards & Mobility. A Postman collection is provided.

## Protocol nuances (why this is ONDC-peculiar)

- **Distinct from internal logs** — a network-facing, schema-bound, token-authenticated push, not your own logging.
- **Token is per subscriber+type, domain-agnostic** — don't reuse one token across subscriber ids/types.
- **Request *and* response, plus ACK/NACK and unsolicited calls** — NO wants the full picture, not just requests.
- **PII anonymized, but not City/Pincode** — those are needed for network analytics.
- **Automated only** — manual submission is non-compliant.

## Sources

- ONDC `[PROD] Network Observability API Schema & Process` + `[PrePROD] Network Observability API Schema`
- ONDC Network Observability notification (14 Jun 2023)
