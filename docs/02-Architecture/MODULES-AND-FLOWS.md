# Modules, interfaces and lifecycle

## Modules
`web` (UI/routes/state), `auth` (sessions), `documents` (metadata, upload, processing), `ingestion` (parse/chunk/embed), `retrieval` (vector search), `chat` (RAG and history), `usage` (quota ledger), `billing` (provider/webhooks), `security` (RLS, validation), `ops` (logs, health).

## State machines
Documents: `pending_upload -> uploaded -> processing -> ready`; processing may transition to `failed`, then retry to `processing`; deletion is `deleting -> deleted`. Enforce via server transitions only.

Subscriptions: `free -> checkout_pending -> active`; `active -> past_due | cancel_at_period_end | canceled`; a cancelled plan loses paid entitlement according to the purchased-through date and payment policy. Never trust the browser success page as confirmation.

## Resilience
- Correlation/request IDs in functions and logs.
- Upload finalization idempotent by document ID and processing version.
- Payment webhook idempotent by unique provider event ID.
- Network retry with jitter for transient AI calls, never duplicate paid usage.
- Concurrent quota enforcement via transaction/atomic DB function.
- Explicit partial failure reconciliation for Storage vs Postgres, with cleanup job.

## API ownership rule
Even if RLS protects SQL tables, every privileged function must derive user ID from verified auth and apply owner/tenant filters before reading or mutating document data.
