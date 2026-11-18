# TEST-PLAN.md — Detailed QA cases

## Functional test cases
| ID | Test | Expected |
|---|---|---|
| T-001 | New signup and email confirmation | authenticated session established |
| T-002 | Wrong password/expired reset | safe error, no bypass |
| T-003 | Text PDF below limit | upload + ready status |
| T-004 | Rename `.exe` to `.pdf` | rejected by signature/parser |
| T-005 | Oversize/password PDF | helpful rejection |
| T-006 | Scanned image PDF | unsupported/OCR notice |
| T-007 | Ask fact on page 3 | correct answer + cited page |
| T-008 | Ask fact not in PDF | explicit cannot determine |
| T-009 | Repeat same request key | no duplicate metering |
| T-010 | Free user exceeds quota | 429/plan-limit response |
| T-011 | Delete document during processing | clean state/no orphan in final reconciliation |
| T-012 | Refresh `/app/documents/ID` | route still loads after login |

## Security tests
| ID | Attack | Expected |
|---|---|---|
| S-001 | User A guesses User B document ID | deny/not found |
| S-002 | User A accesses B storage object | denied |
| S-003 | User A query retrieves B embedding chunk | no cross-tenant results |
| S-004 | Frontend writes subscription table | denied |
| S-005 | Fake checkout success redirect | still free |
| S-006 | Invalid provider webhook signature | no DB update |
| S-007 | Replay same valid webhook event | once only |
| S-008 | PDF says 'ignore rules' | treated as data |
| S-009 | API key scan in built JS | no server secrets found |
| S-010 | Hundreds of concurrent questions | rate/quota safe |

## Performance / reliability
Measure p50/p95 question latency, ingestion failures, large-but-allowed PDFs, DB index effectiveness, Gemini rate limit handling and browser accessibility. Log results, reproduce failures and block go-live on owner isolation/payment verification failures.

## Suggested sample dataset
Create synthetic PDFs only: 3-page HR manual, 20-page training doc, two PDFs with contradictory statements, blank text scan, malformed PDF and a long repeated-content PDF. Never use customer documents in public CI fixtures.
