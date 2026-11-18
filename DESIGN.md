# DESIGN.md — UX/UI specification

## Visual direction
Clean, trustworthy SaaS design. Light surfaces, high contrast text, one clear accent color, readable typography. Avoid visually dense AI marketing claims.

## Suggested tokens
- Background `#F8FAFC`; panel `#FFFFFF`; text `#0F172A`; secondary `#475569`.
- Primary `#2563EB`; primary hover `#1D4ED8`; success `#15803D`; error `#B91C1C`.
- Radius: 12px cards; 8px inputs. Spacing: 4/8/12/16/24/32px. Content max-width: 1200px.
- Font: system UI/Inter substitute. Minimum 16px body and WCAG-appropriate contrast.

## Screens / states
1. **Landing:** headline, upload value proposition, three-step explanation, privacy note, pricing CTA.
2. **Signup/login:** email/password, verification notice, password-reset, failed login messages.
3. **Dashboard:** documents count, current quota, recent PDFs, upload action, ingestion status.
4. **Upload:** drag-and-drop + browse, type/size limit, progress, error/ready state.
5. **Document chat:** document title/metadata on left, question and messages center, cited pages/source preview on right (stack on mobile).
6. **Pricing:** feature matrix, current plan, honest usage caps, upgrade CTA.
7. **Billing:** current status, renewal date, manage via hosted portal.
8. **Settings:** account profile, security, delete account with confirmation.
9. **Admin operations:** internal diagnostics (processing failures and system health); no default document browsing.

## Wireframe: document chat
```text
+---------------------------------------------------------------+
| Logo     Documents     Usage     Billing          User menu    |
+------------------+--------------------------------------------+
| Document list    | File: Employee Handbook.pdf               |
| [Search]         | Status: Ready | 17 pages                  |
| - Handbook       |--------------------------------------------|
| - Policy         | You: What is the leave policy?             |
| + Upload PDF     | AI: The policy states ... [Page 6]         |
|                  | [View quoted source]                        |
|                  |                                            |
|                  | [Ask your question...              ] [Send]|
+------------------+--------------------------------------------+
```

## UX rules
Disable Ask until processing is ready. Explain unsupported scanned PDFs. Show page and document title for citations. Never show a fake percentage for unknown processing time. Show specific quota errors with the upgrade option. Add loading/empty/error/retry states. Never place secrets in browser console or URLs.

## Accessibility
Keyboard operation, visible focus, proper input labels, aria-live for status, accessible dialogs, text alternatives, mobile at 320px+, contrast audits, reduced motion.
