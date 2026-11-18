# P.md — Product requirements

## Product vision
A web SaaS where each registered customer privately uploads documents, asks natural-language questions, and receives concise answers backed by cited excerpts and page numbers.

## User personas
1. **Solo user:** upload contracts, research papers or training PDFs and ask questions.
2. **Paid power user:** larger document quotas and more questions.
3. **Admin/operator:** diagnose document processing, payments and reliability without unrestricted access to private content.
4. **Organization/team:** shared workspace (phase 2; separate security model).

## MVP scope
- Responsive marketing home, pricing, signup/login/reset, dashboard, document list, document detail/chat, usage and billing/settings pages.
- Private upload of PDF files only; configurable size/page limits; reject encrypted/unreadable PDFs initially.
- Status lifecycle: uploaded -> processing -> ready/failed; retry safe, prevent duplicate concurrent ingestion.
- Extract text per page; keep page numbers and source references; vectorize and search relevant chunks.
- Ask questions over one selected document in MVP; multi-document chat phase 2.
- Answer based only on available retrieved context; say when the document does not provide an answer.
- Citations linking to source pages; human-readable usage errors and rate limits.
- Free tier with quotas and Pro paid tier with payment provider where merchant account is eligible.
- Delete document and associated chunks, file and chat records; user account deletion flow.

## Out of scope for MVP
OCR for scanned PDFs, password-protected PDFs, mixed audio/video, public sharing, multi-org ACL, editable PDFs, bulk import, legal/medical accuracy guarantees, native mobile app.

## Acceptance criteria
- User A cannot read, list, download, retrieve vector hits or chat with User B's documents, even by editing IDs.
- Unauthenticated access to uploads/chats/checkout creation is denied.
- For a text-based PDF, upload completes within an acceptable limit, page references are preserved and a cited answer can be returned.
- Bad or unsupported files are rejected with an actionable explanation.
- Free quota cannot be bypassed by refreshing, parallel requests or client-side API changes.
- Paid access is provisioned **only after verified provider events**; duplicate events are idempotent; failed or cancelled payments handled.
- RAG refuses to manufacture a source citation when no matching pages were retrieved.
- Device/mobile experience is usable; keyboard accessible.

## Suggested starter plans (illustrative; adjust after measuring cost)
| Feature | Free | Pro | Team (later) |
|---|---:|---:|---:|
| PDFs | 3 | 50 | Organization quota |
| PDF max size | 5 MB | 20 MB | Configurable |
| Questions/month | 20 | 500 | Shared quota |
| Chat history | Yes | Yes | Yes |
| Citations | Yes | Yes | Yes |
| Shared workspace | No | No | Later |

These are *product target limits*, not guaranteed free-infrastructure capabilities. Enforce all on server.

## Product metrics
Signup conversion; activation (first successful upload and question); successful ingestion rate; answer latency; citations clicked; failed-question rate; monthly active users; free-to-paid conversion; churn; cost per processed page and answer.

## Open decisions
Choose merchant country/payment provider, launch region and data retention policy; select supported Gemini generation/embedding models and vector dimension; define exact limits for scanned PDFs and cancellation behavior.
