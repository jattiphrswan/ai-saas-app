# FREE-DEPLOYMENT.md — Put the AI SaaS live with minimal upfront cost

**Read before using:** These are deployment instructions for your **future implemented app**; the documentation ZIP does not include the running application. Free plans, availability and limits change. See `13-Reference/OFFICIAL-LINKS.md` and verify current account status.

## Recommended deployment layout
- **Frontend:** React/Vite static SPA on Cloudflare Pages -> `your-project.pages.dev` (no purchased domain required).
- **Backend:** Supabase Auth/PostgreSQL/pgvector/Private Storage/Edge Functions on a Supabase Free project while under limits.
- **AI:** Gemini API only if a supported model offers an applicable free tier for your region/account and data terms; otherwise paid per usage.
- **Payments:** payment provider test mode for free feature testing; live payments charge fees and require an approved merchant.

## Step 1 — Prepare and verify the code locally
1. Complete the full app and backend, not just this docs folder.
2. Run `npm install`, `npm run build`, configured tests and two-user access tests.
3. Confirm the output folder is `dist/` and `package.json` contains `build`.
4. Commit working code to a GitHub repository; check no `.env` or API secrets are tracked.

## Step 2 — Create Supabase Free project
1. Visit https://supabase.com/dashboard and create a project; securely retain the DB password.
2. In Project Settings/API, copy project URL and publishable key.
3. Configure Auth email sign-in and verification; use localhost callback in development.
4. Run reviewed SQL migrations; enable and test RLS on **every** exposed table.
5. Create a private Storage bucket named `pdfs`; add owner-based policies or server-only signed upload flows.
6. Enable needed extensions (including vector if available), and ensure embedding dimension matches the selected model.
7. Do not use free Supabase backups as a substitute for a tested backup plan.

## Step 3 — Deploy Supabase Edge Functions
1. Install and log into Supabase CLI following current official instructions.
2. Link the project with `supabase link --project-ref YOUR_PROJECT_REF`.
3. Put server functions under `supabase/functions/<function-name>/index.ts`.
4. Deploy functions as implemented, e.g. `supabase functions deploy ask-question` and `supabase functions deploy create-upload`.
5. Add server-only secrets via Supabase dashboard or `supabase secrets set` using secure local methods: `GEMINI_API_KEY`, payment secret, webhook signing secret, etc.
6. Keep JWT verification enabled on authenticated functions. The webhook requires provider signature verification even if JWT verification is disabled for that endpoint.
7. Exercise functions directly with valid and invalid sessions.

**Important:** Long/large PDF parsing can exceed free Edge Function runtime; MVP caps PDF size and page count and may need a paid/queued worker later.

## Step 4 — Deploy frontend to Cloudflare Pages (free subdomain)
1. Visit https://dash.cloudflare.com and open **Workers & Pages**.
2. Select **Create application -> Pages -> Connect to Git** (labels may change).
3. Connect GitHub and select the application repository/branch.
4. Set Framework preset `Vite` (or none), Build command `npm run build`, Build output directory `dist`.
5. Add **only** public build-time variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
6. Trigger Deploy; Cloudflare produces an HTTPS `*.pages.dev` address.
7. For React Router deep links, use SPA fallback or a `_redirects` rule such as `/* /index.html 200` in `public/_redirects` **only if it doesn't rewrite needed backend/static routes**. Verify `/app/documents/:id` refresh works.

## Step 5 — Configure production callback URLs
1. Supabase Auth -> URL configuration: set Site URL to exact HTTPS `https://YOUR-PROJECT.pages.dev`.
2. Allow listed redirect URLs such as `https://YOUR-PROJECT.pages.dev/auth/callback` and `http://localhost:5173/auth/callback` for dev. Never use overly broad wildcards in production.
3. Configure function CORS to the production site origin and localhost dev only where appropriate.
4. Test email verification, password reset and session expiration at the **live** hostname.

## Step 6 — Configure AI provider
1. Create an API key through official AI provider console.
2. Choose a **currently available** text generation and embedding model with known free/paid terms, output dimensions and rate limits.
3. Save API key in Supabase Edge Function secrets, never `VITE_` variables.
4. Verify text-only PDF uploads, 1 document/1 question, and no-context response with real API quota.
5. Place hard question/page/token caps before inviting users.

## Step 7 — Payments (test mode first)
1. Confirm your company/merchant is eligible for live recurring billing in your operating country.
2. Create test Products/Prices for `pro` and obtain server-side price ID.
3. Configure server-side hosted checkout, subscription/webhook processing and customer portal.
4. Register the deployed webhook URL at the payment provider; place webhook signing key in Supabase secrets.
5. Test success, cancellation, failed renewal, duplicate webhook and spoofed webhook.
6. Switch to live mode **only after account approval, payment/legal checks and security QA**. Real payments incur provider fees.

## Step 8 — Launch verification
- Signup -> verified login -> upload -> status ready -> ask -> citation -> return later.
- User B cannot view/ask/delete User A data, including with copied UUIDs.
- Free plan quota blocks further requests in concurrent sessions.
- Sandbox paid subscription active only after genuine signed webhook.
- Production frontend does not expose keys, stack traces, PDFs or other users' content.
- Deep-link refresh, mobile, logout/reset, deletion and provider failure UX all pass.
- Check free tier quota dashboard and alerts.

## Common errors
| Symptom | Likely cause | First action |
|---|---|---|
| Blank deployed page | wrong `dist` output/env vars | inspect build logs and network tab |
| `/app` refresh 404 | SPA fallback | configure fallback and redeploy |
| Login redirect incorrect | Supabase Site URL/allowed redirect | set exact deployed HTTPS URLs |
| Upload 403 | private Storage policy or signed URL | check owner/policy and expiry |
| Ask fails | Edge Function auth/secret/model/rate | check sanitized function logs |
| PDF stuck processing | parser timeout, bad PDF or retry logic | check error state and bounded worker |
| Paid plan not active | webhook not delivered/verified | inspect provider event logs and DB records |
| Database quota reached | vectors/storage too large | reduce upload caps, archive/delete, upgrade |

## Free-tier limits to verify, not hardcode
Supabase Free historically lists 500 MB DB and 1 GB file storage; Cloudflare Pages Free documents free builds/deploy limits. Limits and project idle policies change. AI free requests vary by **model and account**. Validate on official dashboards before users upload private files.

## Costs you should expect eventually
Custom domain renewal, higher file/database/compute usage, paid AI tokens, payment fees, transactional email, monitoring and secure backups. No legitimate deployment plan can promise zero costs at any scale.
