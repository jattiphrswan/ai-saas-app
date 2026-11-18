# Environment variable registry

## Browser build-time (`.env.local`, Cloudflare Pages public)
```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
```
Only `VITE_` variables safe to expose to all visitors. **Do not** put Gemini or provider secrets here.

## Supabase Edge Function secrets (server only)
```dotenv
GEMINI_API_KEY=SERVER_ONLY
GEMINI_GENERATION_MODEL=SUPPORTED_MODEL_ID
GEMINI_EMBEDDING_MODEL=SUPPORTED_EMBEDDING_MODEL_ID
PAYMENT_PROVIDER_SECRET=SERVER_ONLY
PAYMENT_WEBHOOK_SECRET=SERVER_ONLY
PAYMENT_PRO_PRICE_ID=SERVER_ALLOWLISTED_PRICE
```
Supabase runtime supplies some project variables by default; consult current docs before adding custom values. Never leak a service role key to the browser.

## Env checklist
- [ ] Separate dev, staging and production config.
- [ ] Validate required vars at function startup.
- [ ] `.env*` ignored except checked-in `.env.example` with fake values.
- [ ] Secrets rotated after accidental logging or sharing.
- [ ] All callbacks/origins and webhook endpoints updated per environment.
