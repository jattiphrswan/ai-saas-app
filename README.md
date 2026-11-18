# DocChat AI — AI-Powered PDF Chat SaaS

> A modern, multi-tenant SaaS application built with **React** and backed by a **100% Free PostgreSQL** database with `pgvector` AI retrieval. Deployed free on **Vercel**.

![Frontend: React 19](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript%20%7C%20Vite-blue?logo=react)
![Database: PostgreSQL](https://img.shields.io/badge/Database-Free%20PostgreSQL%20%2B%20pgvector-336791?logo=postgresql)
![Hosting: Vercel](https://img.shields.io/badge/Hosting-Vercel%20(Free%20Tier)-black?logo=vercel)
![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?logo=tailwindcss)

---

## ⚡ Core Architecture

| Layer | Technology | Cost | Description |
|---|---|---|---|
| **Frontend Framework** | **React 19** + TypeScript + Vite | **$0 (Free)** | Modern component-based SPA with instant HMR and client-side routing |
| **Styling** | **Tailwind CSS v4** | **$0 (Free)** | Clean, responsive design with Lucide icons & toasts |
| **Database** | **PostgreSQL 15+** (Supabase Free) | **$0 (Free)** | Dedicated cloud PostgreSQL with 500 MB storage & native `pgvector` |
| **Vector Search** | **pgvector** (`VECTOR(768)`) | **$0 (Free)** | Native PostgreSQL cosine distance index for AI excerpt matching |
| **Database Security**| **PostgreSQL RLS** (Row Level Security)| **$0 (Free)** | Multi-tenant tenant isolation enforced directly by the database engine |
| **Authentication** | **Supabase Auth** (PostgreSQL-backed) | **$0 (Free)** | Secure email/password verification and session management |
| **Document Storage**| **Supabase Storage** | **$0 (Free)** | 1 GB private encrypted bucket for PDF documents |
| **Hosting & CDN** | **Vercel** | **$0 (Free)** | Global Edge network, automatic SSL, and continuous GitHub deployment |
| **AI LLM & RAG** | **Google Gemini API** | **$0 (Free Tier)** | Gemini 1.5 Flash (generation) + text-embedding-004 (768-dim embeddings) |

---

## 🗄️ Why PostgreSQL is the Best Free Database for AI SaaS

This application runs directly on **PostgreSQL** because:

1. **Native Vector Support (`pgvector`):** Unlike MySQL or MongoDB, PostgreSQL can store high-dimensional AI vectors directly alongside your relational tables in the `document_chunks` table.
2. **Row Level Security (RLS):** Data privacy is enforced by PostgreSQL at the database level:
   ```sql
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "owner" ON documents USING (auth.uid() = user_id);
   ```
   Users can never read or query another user's documents or vector embeddings.
3. **Direct SQL Access:** You can connect directly using any PostgreSQL client (DBeaver, TablePlus, pgAdmin, or psql) using your PostgreSQL connection string:
   ```text
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-REF].supabase.co:5432/postgres
   ```
4. **Free Tier Providers Supported:**
   - **Supabase** (Recommended): Free PostgreSQL 15 + pgvector + Auth + Storage + Edge Functions.
   - **Neon**: Free serverless PostgreSQL 16 with pgvector support.

---

## 📁 Repository Structure

All architecture and planning documents are kept in [`docs/`](./docs/):

```text
├── docs/                      # Complete Architecture, Specs & Planning Docs
│   ├── MASTER-DOCS.md         # Single Source of Truth Master Blueprint
│   ├── 00-START-HERE/         # Project map & ADRs
│   ├── 01-Planning/           # Scope & user stories
│   ├── 02-Architecture/       # System diagrams & flows
│   ├── 03-Design/             # Screen layouts & components
│   ├── 04-Database/           # PostgreSQL Schema & migrations
│   ├── 05-Backend/            # Edge Function contracts
│   ├── 06-AI-RAG/             # PDF chunking & pgvector search
│   ├── 07-Security/           # PostgreSQL RLS policies & threat mitigation
│   ├── 08-Billing/            # Subscription lifecycle
│   ├── 09-Development/        # Local sprint checklist
│   ├── 10-Deployment/         # Free deployment guide
│   ├── 11-Testing/            # Test scenarios
│   ├── 12-Operations/         # Monitoring & incident runbook
│   └── 13-Reference/          # Environment variables & links
├── public/                    # Static assets & icons
├── src/                       # React 19 Frontend application
│   ├── hooks/                 # useAuth, useDocuments, useSubscription
│   ├── layouts/               # DashboardLayout navigation
│   ├── lib/                   # Supabase client & utilities
│   ├── pages/                 # Marketing, Auth, and Dashboard pages
│   └── types/                 # TypeScript interfaces & plan limits
├── supabase/                  # PostgreSQL database & backend functions
│   ├── migrations/            # 001_initial_schema.sql (PostgreSQL + pgvector)
│   └── functions/             # ask-question, create-upload, billing-webhook, etc.
└── vercel.json                # Vercel SPA routing rewrite rules
```

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/jattiphrswan/ai-saas-app.git
cd ai-saas-app
npm install
```

### 2. Start Local React Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> [!NOTE]
> The app comes with **Zero-Config Local Preview Mode** enabled. You can immediately create a local account, upload sample PDFs, test the chat UI with cited page references, and explore all dashboard features without configuring external services first.

---

## ☁️ Free Cloud Deployment Guide

### Step 1: Set Up Free PostgreSQL on Supabase
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql).
3. Under **Storage**, create a private bucket named `pdfs`.
4. Deploy the backend Edge Functions:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase functions deploy
   ```

### Step 2: Deploy React Frontend to Vercel (100% Free)
1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository: `jattiphrswan/ai-saas-app`.
2. Framework preset will automatically detect **Vite**.
3. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = Your Supabase anon public key
4. Click **Deploy**. Your app is live with a free HTTPS domain (`*.vercel.app`).

---

## 📄 Master Documentation

For detailed architectural decisions, PostgreSQL schema diagrams, and security models, refer to:  
**[`docs/MASTER-DOCS.md`](./docs/MASTER-DOCS.md)**
