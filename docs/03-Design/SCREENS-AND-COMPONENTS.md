# Screen inventory and React component plan

| Route | Components | Loading/empty/error states |
|---|---|---|
| `/` | Header, Hero, HowItWorks, PricingPreview, Footer | skeleton where appropriate |
| `/signup`, `/login` | AuthForm, PasswordField, AuthMessage | invalid credentials, expired email link |
| `/app` | DashboardStats, UsageMeter, RecentDocuments | zero documents, offline |
| `/app/documents` | UploadDialog, DocumentCard, StatusBadge, FilterBar | upload error, no files |
| `/app/documents/:id` | DocumentSidebar, ChatTimeline, CitationChip, SourceDrawer, ChatComposer | processing, no answers, permission denied |
| `/app/usage` | UsageMeter, PlanLimits | quota exceeded |
| `/app/billing` | CurrentPlan, UpgradeCard, BillingPortalButton | checkout failure, pending payment |
| `/app/settings` | ProfileForm, SecurityPanel, DeleteAccountDialog | save error |

## React directory suggestion
```text
src/
  app/router.tsx
  components/ui/
  components/documents/
  components/chat/
  components/billing/
  features/auth/
  features/documents/
  features/chat/
  features/billing/
  lib/supabase.ts
  lib/api.ts
  hooks/
  styles/
```

## Behavior rules
- Never show a document as ready until backend confirms it.
- Citations navigate to an authorized, short-lived document preview, not a public bucket URL.
- Composer indicates which file is queried; prevent accidentally answering against a different document.
- Show retry for transient network errors; do not replay a paid request without a stable idempotency key.
- All action buttons have disabled/loading states and visible feedback.
