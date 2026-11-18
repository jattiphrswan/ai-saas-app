# Operations runbook

## Routine
Daily: verify errors/failed ingestion and payment webhook failures. Weekly: AI request volume/cost, DB and Storage usage, queue/retry backlog, checkout anomalies and dependency CVEs. Monthly: test restore, review access/users, expired files, keys and policy changes.

## Alerts
- Ask-question 5xx rate above baseline.
- PDF processing failed/stuck beyond defined threshold.
- Provider webhook failures or unknown customer mappings.
- Supabase DB/Storage over 70–80% target quota.
- AI usage approaching permitted budget or rate.
- Sudden spikes in auth errors or signed URL misuse.

## Incident playbooks
**AI outage:** stop retries after bounded attempts; show temporary error; do not debit success-only question usage; record request IDs.  
**PDF failures:** mark failed and explain; allow safe retry; check parser caps.  
**Payment failure:** never grant Pro from browser redirect; reconcile via provider API/event logs.  
**Data exposure:** stop affected functions, rotate keys, inspect scope, follow legal notification rules.

## Backup/recovery
Supabase Free may not provide managed database backups. Establish an encrypted scheduled export under appropriate credentials, test restore into a separate project and implement retention/access restrictions. Customer PDFs require a separate storage backup policy if business continuity demands it.

## Customer operations
Document support SOP for failed upload, subscription cancellation, refund requests, account deletion, consent and AI accuracy complaints. Avoid downloading customer PDFs into support systems unless authorized.
