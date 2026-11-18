# Decision register

| ID | Decision | Why | Revisit when |
|---|---|---|---|
| ADR-001 | React/Vite static SPA | Simple static hosting | SSR needed |
| ADR-002 | Supabase integrated backend | Auth, DB, storage, functions together | Free quotas insufficient |
| ADR-003 | pgvector with per-document filter | Small MVP retrieval | Cross-document or scale demands |
| ADR-004 | PDF text-only MVP | Avoid unreliable OCR and large compute | User research validates OCR |
| ADR-005 | Hosted provider checkout | Reduce sensitive payment handling | Merchant account not eligible |
| ADR-006 | Model IDs configurable | Provider availability changes | Each API rollout |

## Critical unresolved decisions
- Merchant's country and provider approval (Stripe / supported regional gateway).
- AI model and embedding vector dimensions actually available for the deployment account.
- Commercial terms and data use for the selected AI free tier.
- Required deletion retention, terms, tax/invoice compliance.
- Whether customers can upload confidential/regulated materials; default answer is **not until legal/security review**.
