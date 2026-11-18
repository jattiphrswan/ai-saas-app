# ROADMAP.md — Milestones and delivery order

## Phase 0 — Preparation
- [ ] Confirm legal entity/merchant country, target users, pricing and privacy requirements.
- [ ] Create GitHub repo, backlog, environment files and service accounts.
- [ ] Choose current supported AI generation + embedding models and dimensions.

## Phase 1 — Foundation
- [ ] Scaffold React/Vite TypeScript Tailwind.
- [ ] Set up Supabase project, migrations, Auth redirects and RLS.
- [ ] Build public pages, navigation, auth forms and protected shell.

## Phase 2 — Documents
- [ ] Implement private Storage upload, validations and owned document metadata.
- [ ] Extract text with page numbers; chunk and embed; persist vector rows.
- [ ] Status UI, retries, failure reasons and deletes.

## Phase 3 — AI conversations
- [ ] Server-side embed query + filtered retrieval + grounded answer.
- [ ] Citation validator, chat persistence, zero-evidence response.
- [ ] Rate limiting and usage accounting.

## Phase 4 — Billing
- [ ] Create plans/prices in provider test mode.
- [ ] Hosted checkout, signed webhook, subscription state machine.
- [ ] User portal, cancel/renewal/downgrade edge cases.

## Phase 5 — QA and launch
- [ ] Cross-user access/IDOR tests, malicious file tests, payment replay tests.
- [ ] E2E signup-upload-chat-upgrade flows and load/latency checks.
- [ ] Deploy frontend, functions, migrations, secrets; configure domain/redirects.
- [ ] Confirm production payment availability and monitoring; launch only after gates pass.

## Phase 6 — Growth
OCR, multiple-document chats, organization workspaces, team permissions, admin analytics, multilingual UI, hybrid search, asynchronous ingestion.

## Dependencies
`auth -> RLS -> private upload -> extraction -> embeddings -> retrieval -> AI response -> metering -> billing -> launch`.

## Exit gate
Do **not** enable paid production checkout until owner isolation, signed webhooks, verified entitlement transitions and privacy policies are tested.
