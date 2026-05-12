## PayGuard AI v2 — Dual-Portal Restructure (Frontend-only mock)

Backend stays stubbed. All auth, data, uploads, and Squad calls live in Zustand stores with `localStorage` persistence so the demo survives refreshes.

### New routing

```
/                       Landing — pick "I'm a Worker" or "I'm a Company"
/auth/login             Tabbed Worker / Company login
/auth/signup            Tabbed signup (worker fields vs company fields)

/admin                  Layout (desktop, role-gated)
  /admin/dashboard       Smart Decision Ledger (existing, refit to new schema)
  /admin/batches         Payroll Batch Manager (Excel upload, status list)
  /admin/wallet          Squad Wallet funding UI
  /admin/appeals         Appeals Inbox
  /admin/transaction-failed/$ref   Detailed failure help page

/worker                 Layout (mobile-first, role-gated)
  /worker/home           Status tracker (Pending / Verified / Flagged / Rejected + score)
  /worker/claim          Claim-record wizard (NIN + Account #)
  /worker/documents      Upload PDFs + screenshots
  /worker/appeal         Appeal form (message + 1 supporting doc)

/wizard, /audit         Kept, repositioned as admin tools
```

Existing `/dashboard` becomes `/admin/dashboard`; old `/wizard` and `/audit` move under `/admin`.For the worker's side of things, the mobile-first design doesn't necessarily mean that it won't be manifested as a desktop site but I'm just saying that they should also work on making it mobile-first as not all the workers may have access to laptops or computers.

### Mock auth + RBAC

- `src/store/authStore.ts` (Zustand + persist): `user { id, role: 'worker'|'company_admin', ...profile }`, `signup`, `login`, `logout`.
- `RequireRole` wrapper used inside `/admin` and `/worker` layout routes — redirects to `/auth/login` or the other portal's home if the role is wrong.
- Landing page detects logged-in user and offers "Continue to your portal".

### Scoring engine

`src/lib/scoring.ts` — pure function:

```
NIN verified            +25
Name matches            +20
Statement valid         +20
Screenshot matched      +15
Receipt matched         +15
Transaction ref valid   +15
```

Status mapping: `>=80 verified`, `50–79 flagged`, `<50 rejected`.

`ledgerStore` rows gain `checks: { ninVerified, nameMatch, statementValid, screenshotMatch, receiptMatch, txnRef }`, derived `score` and `verificationStatus`. Mock data seeded so all three buckets exist.

### Admin portal (desktop)

- **Batches**: drag-and-drop Excel zone (mock parse → fake batch row), status chips `pending → processing → funded → completed`.
- **Wallet**: balance card + "Fund Wallet via Squad" form. ~15% chance the mock call fails → redirect to `/admin/transaction-failed/$ref` with code, reference, and troubleshooting list.
- **Ledger refit**: new `Trust Breakdown` expansion showing the 6 checks as ✓/✗ chips, score bar, "Disburse via Squad" disabled unless `verified`, "Manual Review" modal for flagged rows where admin can tick missing checks to override and re-score.
- **Appeals Inbox**: list of worker appeals with message + attached ID, Approve/Reject actions feeding back into the worker's status.
- **FilterBar** gains a verification-status filter.

### Worker portal (mobile-first)

- **Home**: big status card (color-coded), score `xx/110`, next-step CTA.
- **Claim wizard**: enter NIN (11 digits) + Account # (10 digits), validate, match against mock payroll → success or "Discrepancy Detected" screen with `Request Manual Appeal` button.
- **Documents**: large touch targets, separate cards for Bank Statement PDF and Transaction Screenshot, animated "Score Tally" on submit (counts up the points awarded).
- **Appeal form**: textarea + single supporting-document upload (e.g. National ID), submits to admin Appeals Inbox.
- **Rejected lock state**: upload buttons disabled, only "Request Appeal" enabled.

### Shared

- `src/components/common/StatusPill.tsx` — semantic colors (green/yellow/red/grey) reused everywhere.
- `src/components/common/ScoreBreakdown.tsx` — used in admin Manual Review modal and worker tally.
- `RealTimeWebhookFeed` already exists — reused on admin dashboard; add toast bridge so successes/failures also fire `sonner` toasts.
- New tokens in `src/styles.css`: `--status-verified`, `--status-pending`, `--status-flagged`, `--status-rejected` (semantic, on top of existing risk tokens).

### State files

- `src/store/authStore.ts` — mock auth.
- `src/store/batchStore.ts` — payroll batches + wallet balance + transaction failures.
- `src/store/appealStore.ts` — appeals queue.
- Existing `wizardStore`, `ledgerStore`, `feedStore` kept; ledgerStore gains the new check fields and score derivation.

### Out of scope (this pass)

Real Supabase Auth, real RLS, real Excel parsing, real Squad API, real OCR. All are stubbed behind clearly-named functions ready to swap in a follow-up "wire Lovable Cloud" prompt.