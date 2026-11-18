# Backend API contracts (Edge Functions)

All authenticated functions require `Authorization: Bearer <Supabase access_token>`. Server validates token and derives user ID; do not accept `userId` from request body. Provide typed schema validation. Responses use `{data, error, requestId}`.

## `POST /functions/v1/create-upload`
Input `{filename, bytes, mimeType}`. Verify auth, PDF extension/MIME, size and plan quota. Create owned pending row, return `{documentId, uploadUrl, expiresAt}`. Signed URL must target a server-generated private path.

## `POST /functions/v1/finalize-upload`
Input `{documentId}`. Re-verify owner and storage file, PDF magic bytes and limits, acquire processing lock. Starts bounded ingestion or queues job. Return `{status:'processing'}`. Idempotent repeat must not duplicate chunks.

## `GET /documents` / `GET /documents/:id`
Prefer direct Supabase PostgREST with strict RLS for readonly metadata. Never expose other users' rows.

## `POST /functions/v1/ask-question`
Input `{documentId, conversationId?, question, requestKey}`. Verify JWT, owner, `ready`, input length, quota and request key. Retrieve authorized chunks; return `{answer, citations:[{documentId,pageNumber,chunkId}], conversationId, usage}`. No fabricated citation IDs.

## `POST /functions/v1/create-checkout`
Input `{planCode}`. Server maps plan code to *allowlisted* provider price ID. Verify authenticated user, create hosted checkout server-side and return `{checkoutUrl}`. Never accept client-supplied price amount.

## `POST /functions/v1/billing-webhook`
No user JWT required; provider signature over raw request body **mandatory**. Map signed events to internal customer and subscription, idempotently apply state. Return 2xx only on safely handled event.

## `POST /functions/v1/billing-portal`
Auth user -> find owned provider customer ID -> create hosted session -> return URL.

## Security/error conventions
400 validation; 401 missing/invalid auth; 403 unauthorized; 404 inaccessible resource; 409 wrong state; 413 oversized; 429 quota/rate limit; 502 upstream AI provider issue. Do not return stack traces, storage paths or API secrets to browsers.
