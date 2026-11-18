# A.md — Application overview

## Single-sentence description
A secure, subscription-enabled web application for chatting with PDF documents using retrieval-augmented AI.

## Main user journey
1. Open landing page -> review plans -> create account -> verify email.
2. Sign in -> dashboard -> upload a PDF -> see processing status.
3. Open ready document -> enter a question -> backend retrieves permitted PDF chunks.
4. AI returns a grounded answer with clickable document/page citations.
5. User checks remaining quota or upgrades through secure hosted checkout.
6. User can manage history, delete documents, change plan and remove account.

## Roles
- `user`: owns PDFs, conversations and personal billing metadata.
- `admin`: operational access to service metadata through protected server paths. Admin **must not** be assumed able to read document content.
- `team_owner`, `team_member`: reserved for a future organization-aware release, **not** included in MVP schema authorization.

## Pages / routes
`/`, `/pricing`, `/login`, `/signup`, `/forgot-password`, `/auth/callback`, `/app`, `/app/documents`, `/app/documents/:id`, `/app/usage`, `/app/billing`, `/app/settings`, `/legal/privacy`, `/legal/terms`, `/404`.

## Major backend operations
`create-upload` (owner+quota), `finalize-upload` (validate+ingest), `ask-question` (authenticate+authorize+retrieve+AI+meter), `create-checkout` (auth+provider), `billing-webhook` (signature+idempotency), `billing-portal`, `delete-document` and background cleanup.

## Data flow
Browser (Supabase session) -> Edge Function (verify identity and entitlement) -> PostgreSQL/Storage -> Gemini API -> validated, cited response -> browser.

## User experience principles
Simple language, persistent progress/status, fast feedback, explicit usage limits, privacy transparency, no fabricated references, accessible design, mobile-first.

## Definition of done
See `09-Development/BUILD-CHECKLIST.md`, `11-Testing/TEST-PLAN.md` and `10-Deployment/LAUNCH-CHECKLIST.md`.
