# Master implementation checklist

## Foundation
- [ ] `SET-01` Product and MVP scope approved; provider/region chosen.
- [ ] `SET-02` React/Vite/Tailwind scaffold in GitHub.
- [ ] `SET-03` Supabase project and local/staging/production config.
- [ ] `SET-04` CI build/lint/test checks; protected main branch.

## Auth and security
- [ ] `AUTH-01` Signup/login/verification/password reset/logout.
- [ ] `AUTH-02` Protected routes and server-side JWT verification.
- [ ] `SEC-01` Table RLS and private storage policies.
- [ ] `SEC-02` Two-user isolation tests for every endpoint.
- [ ] `SEC-03` Secret and content data leakage audit.

## Documents
- [ ] `PDF-01` Upload validation and signed private upload.
- [ ] `PDF-02` Processing status and retries.
- [ ] `PDF-03` PDF text/page extraction and explicit unsupported scans.
- [ ] `PDF-04` Chunking+embeddings+vector persistence.
- [ ] `PDF-05` Delete with orphan cleanup.

## AI and chat
- [ ] `RAG-01` Owner-filtered vector retrieval.
- [ ] `RAG-02` Answer prompt and citation validation.
- [ ] `RAG-03` Chat history and no-evidence responses.
- [ ] `RAG-04` Question and upload quotas with atomic metering.
- [ ] `RAG-05` Evaluation dataset and latency/cost measurements.

## Billing
- [ ] `BILL-01` Sandbox hosted checkout.
- [ ] `BILL-02` Signed/idempotent webhook processing.
- [ ] `BILL-03` Plan entitlements in backend.
- [ ] `BILL-04` Cancellation, renewal, failed payment and portal.

## Deployment
- [ ] `DEP-01` Cloudflare Pages environment configured.
- [ ] `DEP-02` Supabase Edge Functions deployed and secrets set.
- [ ] `DEP-03` Auth redirects and browser CORS set.
- [ ] `DEP-04` SPA deep links work.
- [ ] `DEP-05` All launch gate tests passed.
- [ ] `OPS-01` Logs, alerts, retention and incident runbook.
