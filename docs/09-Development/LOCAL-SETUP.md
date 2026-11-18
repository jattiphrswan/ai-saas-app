# Local development — step-by-step

## Accounts and local tools
Install Node.js current LTS, Git, a code editor and Supabase CLI if you use local Supabase emulation. Open GitHub, Supabase, Cloudflare and the chosen AI provider. Payment sandbox account optional until billing sprint.

## 1. Create project
```bash
npm create vite@latest ai-pdf-chat -- --template react-ts
cd ai-pdf-chat
npm install
npm install @supabase/supabase-js react-router-dom zod
npm install -D tailwindcss @tailwindcss/vite
npm run dev
```
Pin dependencies and adapt Tailwind setup to the installed version; follow official docs for exact config. Add linting, testing and formatting before features.

## 2. Git setup
```bash
git init
git add .
git commit -m "chore: initialize React SaaS frontend"
```
Create a **private** GitHub repository and push. Never commit `.env.local`, secrets, private documents or exported customer data.

## 3. Frontend environment
Create `.env.local` with only browser-safe keys:
```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
```
Use the publishable key variant supplied by your current Supabase dashboard. Frontend never reads service role/API AI/payment secrets.

## 4. Supabase configuration
Create project; record URL/publishable key; enable email auth and verification; configure site URL `http://localhost:5173` and callback allowed list; create private `pdfs` bucket; apply reviewed migrations and RLS; configure server functions and deployment secrets separately.

## 5. Implement in order
`auth -> app shell -> document metadata and private uploads -> safe parsing -> embeddings -> RAG -> citations -> usage -> payment sandbox -> tests`.

## 6. Local development tests
Open 2 different user accounts; ensure each sees only their own docs. Try invalid PDF, big PDF, scanned PDF, AI absence, payment failure and session expiration. Test real backend, not only UI mocks.

## 7. Commands after scripts configured
```bash
npm run build
npm run dev
# npm run lint
# npm run test
```
The latter two are examples: add these package scripts before executing.
