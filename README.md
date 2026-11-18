# DocChat AI — AI-Powered PDF Chat SaaS

> A modern, multi-tenant SaaS application that allows users to upload PDF documents, ask natural-language questions, and receive grounded answers with exact source page citations.

![Tech Stack](https://img.shields.io/badge/Stack-React%2019%20%7C%20TypeScript%20%7C%20Tailwind%20%7C%20Supabase%20%7C%20pgvector-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ⚡ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React Hot Toast
- **Hosting:** Vercel (100% Free tier supported)
- **Database:** Supabase (Free PostgreSQL + pgvector extension)
- **Storage:** Supabase Private Storage Buckets (Row-Level Security)
- **AI / RAG:** Gemini 1.5 Flash (Generation) + text-embedding-004 (Embeddings)
- **Billing:** Stripe / Razorpay Subscriptions (Test mode & Webhooks supported)

---

## 📁 Repository Structure

All documentation and specifications are organized in the [`docs/`](./docs/) directory:

```text
├── docs/                      # Complete Architecture, Specs & Planning Docs
│   ├── MASTER-DOCS.md         # Single Source of Truth Master Blueprint
│   ├── 00-START-HERE/         # Project map & ADRs
│   ├── 01-Planning/           # Scope & user stories
│   ├── 02-Architecture/       # System diagrams & flows
│   ├── 03-Design/             # Screen layouts & components
│   ├── 04-Database/           # Schema & migrations
│   ├── 05-Backend/            # Edge Function contracts
│   ├── 06-AI-RAG/             # PDF chunking & vector search
│   ├── 07-Security/           # RLS policies & threat mitigation
│   ├── 08-Billing/            # Subscription lifecycle
│   ├── 09-Development/        # Local sprint checklist
│   ├── 10-Deployment/         # Free deployment guide
│   ├── 11-Testing/            # Test scenarios
│   ├── 12-Operations/         # Monitoring & incident runbook
│   └── 13-Reference/          # Environment variables & links
├── public/                    # Static assets & icons
├── src/                       # React frontend application
│   ├── hooks/                 # useAuth, useDocuments, useSubscription
│   ├── layouts/               # DashboardLayout navigation
│   ├── lib/                   # Supabase client & utilities
│   ├── pages/                 # Marketing, Auth, and Dashboard pages
│   └── types/                 # TypeScript interfaces & plan limits
├── supabase/                  # Supabase database & backend functions
│   ├── migrations/            # 001_initial_schema.sql (pgvector + RLS)
│   └── functions/             # ask-question, create-upload, billing-webhook, etc.
└── vercel.json                # Vercel SPA routing rewrite rules
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install

```bash
git clone https://github.com/jattiphrswan/ai-saas-app.git
cd ai-saas-app
npm install
```

### 2. Run Local Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> [!NOTE]
> The app comes with **Zero-Config Local Preview Mode** enabled. You can immediately create a local account, upload PDFs, test the chat UI, and explore all dashboard features without configuring Supabase first.

---

## ☁️ Free Cloud Deployment Guide

### Step 1: Set Up Supabase (Free Database & Storage)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in Supabase and run [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql).
3. Under **Storage**, create a private bucket named `pdfs`.
4. Deploy the Edge Functions:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase functions deploy
   ```
5. In your local `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```

### Step 2: Deploy to Vercel (Free Hosting)
1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Framework preset is automatically detected as **Vite**.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Click **Deploy**. Your app is live with a free HTTPS domain (`*.vercel.app`).

---

## 📄 Master Documentation

For detailed architectural decisions, schema diagrams, and security models, refer to:
**[`docs/MASTER-DOCS.md`](./docs/MASTER-DOCS.md)**
