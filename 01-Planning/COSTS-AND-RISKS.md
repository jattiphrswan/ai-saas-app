# Costs, quotas and risks

## Free-first service allocation
| Service | Purpose | Free-first expectation | Risk |
|---|---|---|---|
| Cloudflare Pages | Static React frontend | Free tier available | Build quotas, domain configuration |
| Supabase Free | Auth, Postgres, Storage, Edge Functions | Small MVP usage | DB/storage caps, project pause, function runtime |
| Gemini API | Text generation and embeddings | Free-tier eligibility depends on model, region and account | Rate limits, data-use terms, billable usage |
| GitHub | Source control | Public/private free repo options | Secrets accidentally committed |
| Payment provider | Paid subscriptions | Test mode for development | Live merchant approval and processing/billing fees |
| Domain | Custom URL | Use free `pages.dev` subdomain initially | Custom domains usually cost money |

**Approximate starting hosting spend:** $0 for a very small demo *if every chosen service and model is actually free for your use case*. Do not imply free forever, unlimited usage or free real-payment processing.

## Risks and mitigations
- **LLM hallucination:** show retrieved page citations and abstain on weak evidence.
- **Cross-account data leak:** RLS + enforced owner filters + malicious-ID tests.
- **PDF parser abuse:** reject malformed/encrypted/oversize documents, timeouts, isolated processing.
- **Runaway AI bill:** hard usage caps, rate limit, alerts, avoid automatic paid-tier enablement.
- **Webhook replay:** signature check + unique event ID + transactional state updates.
- **Free hosting limits:** track capacity and define upgrade trigger.
- **Provider outage:** user-friendly errors, bounded retry/backoff.
- **Untrusted content:** treat PDF text as data, not instructions; never let a document control tools/secrets.

## Monitoring costs weekly
Questions processed, generation tokens, embedding tokens, pages ingested, vector count, DB size, storage bytes, edge function failures, payment failures.
