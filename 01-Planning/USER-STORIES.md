# User stories and acceptance tests

## Authentication
**AUTH-01:** As a visitor, I can sign up, verify my email and log in. Acceptance: only verified users enter private dashboard (if email verification enabled); invalid token rejected.  
**AUTH-02:** As a user, I can reset password. Acceptance: reset link expires; session refresh works; app handles expired links.  
**AUTH-03:** As a user, I can log out. Acceptance: client session cleared; protected requests rejected without valid token.

## Documents
**PDF-01:** I can upload a supported PDF. Acceptance: server validates identity, size, file signature, ownership and quota.  
**PDF-02:** I can track processing. Acceptance: ready, failed and retry statuses are visible; retries do not double count.  
**PDF-03:** I can delete a document. Acceptance: content, vectors and related messages removed or anonymized per retention policy; failure retried.

## Questions
**RAG-01:** I can ask about my ready document. Acceptance: answer is grounded, cited and associated with the correct document.  
**RAG-02:** I get an honest answer when evidence is absent. Acceptance: answer says no supporting content found; no invented pages.  
**RAG-03:** I can resume an earlier chat. Acceptance: only own messages load.

## Subscription
**BILL-01:** I can upgrade through hosted checkout. Acceptance: no paid access until signed webhook.  
**BILL-02:** I can manage/cancel renewal. Acceptance: cancellation handling matches business policy.  
**BILL-03:** I cannot exceed limits via API calls or parallel sessions.

## Privacy
**SEC-01:** I cannot access another user's documents/chunks/history through changed identifiers.  
**SEC-02:** I can request account/data deletion and see retention rules before submitting.
