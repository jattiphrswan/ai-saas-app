-- REFERENCE ONLY. Review your access policies, embedding dimensions and production migrations.
-- This starter demonstrates user-owned records; it intentionally omits vector index and billing tables.
create extension if not exists pgcrypto;
create table if not exists public.documents (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 storage_path text not null unique,
 bytes bigint not null check(bytes >= 0),
 status text not null default 'pending_upload' check(status in ('pending_upload','uploaded','processing','ready','failed','deleting')),
 page_count integer check (page_count is null or page_count >= 0),
 created_at timestamptz not null default now()
);
create index if not exists documents_user_id_idx on public.documents(user_id);
alter table public.documents enable row level security;
create policy "owner_select_documents" on public.documents for select to authenticated using (user_id = (select auth.uid()));
-- No direct user INSERT/UPDATE/DELETE policy. Use audited server functions for uploads and status changes.
-- Do NOT add permissive document_chunks policies or public Storage read policies.
-- Ingestion code must own all Storage and chunk writes and verify ownership.
