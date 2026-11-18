# Authentication, authorization, security and privacy

## Identity
Use Supabase Auth with email verification enabled, strong password policy, password reset and token/session expiry. Optional MFA for admins. Enforce auth in server functions and RLS. Configure exact redirect allowlist per environment. Do not build your own password storage.

## Authorization
- Every document, chunk, message, conversation and usage record is user-scoped.
- RLS default-deny and targeted owner policies for direct client access.
- Authenticated users must **not** directly update subscription statuses, billing events, processing status or usage ledger.
- Privileged functions explicitly validate owner before service-role reads/writes.
- Storage bucket is private and policies bind object key to authenticated user; signed URLs are short-lived.
- Server-side retrieval filters both `user_id` and `document_id` before vector ranking results leave DB.

## Upload hardening
Validate PDF magic bytes, extension, MIME, size, page count and encryption. Treat PDF and extracted text as hostile input. Enforce parser time/CPU/memory limits; reject external file references and disallow execution. Consider malware scanning at scale. Disallow public rendering of raw HTML derived from documents.

## API hardening
Server-managed rate limits (user/IP as relevant), quota transactions, input schemas, max prompt length, idempotency tokens, request size and AI timeout. Avoid exposing exact internal exception details. Secure CORS to trusted frontends; CORS alone is not authorization. Use security headers and CSP compatible with your deployment.

## Secrets
Server-only: Gemini API key, Supabase service role key, payment provider secret/webhook key. Never prefix secret names with `VITE_` or commit `.env` files. Browser only uses public Supabase URL and publishable/anon key.

## Privacy and legal
Public privacy policy must explain uploaded file content, AI processing provider, retention, data deletion and subprocessors. Set retention for deleted files, backups, logs and billing records. Obtain informed consent where required. Do **not** market the product as compliant with GDPR/HIPAA or other regulations without legal and technical assessment.

## Threat tests
1. User A tries User B's PDF UUID and signed storage path.
2. Unauthorized client alters plan / price / subscription table.
3. Uploaded PDF includes prompt injection requesting secret disclosure.
4. API receives huge/malformed PDF, concurrency flood or repeated checkout event.
5. Webhook forged, replayed or out of order.
6. User deletes document while processing or asks during re-ingestion.

## Incident process
Revoke compromised keys, block exposed path, preserve sanitized logs, assess leaked data, notify affected users/regulators where required, rotate credentials, verify fix and document postmortem.
