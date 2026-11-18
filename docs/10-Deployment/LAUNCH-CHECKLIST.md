# Production go-live checklist

## Infrastructure
- [ ] Production and staging secrets separated and never committed.
- [ ] Cloudflare Pages build from protected main branch passes.
- [ ] Supabase migrations applied and RLS policies verified with two test users.
- [ ] Private bucket and signed URL expiry verified.
- [ ] Auth production Site URL/redirects/CORS exact.
- [ ] Live server functions have secrets and sanitized logs.

## Product
- [ ] Supported PDF uploads, unsupported PDF errors and retry behavior tested.
- [ ] Chat citations match actual page and document.
- [ ] Quotas enforced server-side under parallel calls.
- [ ] Subscription state tied to verified event and renewal/cancel flow tested.
- [ ] Refund, data retention and privacy/terms pages reviewed.

## Operations
- [ ] Error monitoring and uptime checks active.
- [ ] Storage, DB and AI usage tracked; threshold alerts configured.
- [ ] Backup restore exercise completed.
- [ ] Incident owner, escalation and rollback plan defined.
- [ ] Customer support and deletion process working.

## Launch smoke test
Create fresh user -> verify email -> upload small text PDF -> ask question -> check citation -> test wrong-user denial -> delete -> verify removal. Test payment checkout independently in sandbox before live activation.
