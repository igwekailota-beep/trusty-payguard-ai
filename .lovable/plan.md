# PayGuard AI — Smart Payroll Trust Infrastructure

A high-fidelity React frontend that turns payroll auditing into a guided, AI-gated workflow. Sold to **audit firms** who hold government contracts, demonstrating "Prevention over Detection" — the Squad Transfer API is programmatically locked behind the AI's verdict, so payroll fraud is stopped *before* money leaves the bank.

Built around the team's final pivot: **no biometrics**. The AI works exclusively on Bank Statement PDFs, Payroll CSVs, and Transaction IDs to surface ghost workers, shared accounts, payday-popup accounts, and suspicious salary jumps.

## Design Language

- Authoritative enterprise FinTech: deep navy/indigo primary, slate neutrals, crisp whites, success green, alert amber, fraud red.
- All colors as semantic tokens in `src/styles.css` using `oklch` (no raw color classes in components).
- Subtle motion: scan-line animations over document thumbnails, lock/unlock micro-interactions, skeleton loaders to imply "6 months in 6 seconds".
- Lightweight, responsive layout suited to lower-bandwidth Nigerian context.

## Routes (TanStack Start, file-based)

```
src/routes/
  __root.tsx              shared shell + nav + footer
  index.tsx               landing: value prop + CTA into wizard
  wizard.tsx              4-step Pre-Flight ingestion wizard
  dashboard.tsx           Smart Decision Ledger (command center)
  audit.tsx               Audit trail + printable compliance report
```

Each route gets its own `head()` metadata (title, description, og tags).

## Page 1 — Landing (`/`)

Hero "Stop payroll fraud before money leaves the bank.", trust stats, three pillar cards (Ingest → Analyze → Disburse), Squad-API-locked diagram, CTA → `/wizard`. Audience callout: built for audit firms partnering with state ministries and federal institutions.

## Page 2 — Pre-Flight Wizard (`/wizard`)

Sticky `StepperHeader` (Scope → Ingest → Analyze → Review). Persistent state via Zustand so steps survive navigation/refresh. Validation gates each step.

- **Step 1 — Scope**: searchable Agency/Ministry select (Small Agency / State Ministry / Federal Institution presets matching the revenue model), payroll cycle, expected employee count.
- **Step 2 — Ingestion**: two drag-and-drop zones — Bank Statements (PDFs) and Payroll CSV/XLSX. Mobile camera capture (`capture="environment"`) for scan-to-upload. Per-file status chips (Queued, Scanning, Extracted, Needs Re-scan) with immediate "Needs Re-scan" alerts on bad files.
- **Step 3 — AI Analysis**: animated scan-line over document thumbnails, live checklist (Parsing PDFs → Matching BVN/NIN → Cross-referencing Transaction IDs → Detecting Smart Patterns) with a streaming Risk Confidence score. Cannot proceed until score returns.
- **Step 4 — Review**: executive summary card (Total Payroll, Verified Amount, Potential Savings ₦), split buckets "Ready for Squad Disbursement" vs "Flagged for Manual Review", primary "Authorize Disbursement via Squad" button with a `LogicBadge` ("Squad API Locked. Reason: AI Risk Score > 70" when applicable).

## Page 3 — Smart Decision Ledger (`/dashboard`)

The core command center.

- `FilterBar`: search, department, risk-level, Squad-status filters.
- `LedgerTable` built on **TanStack Table** (sorting, filtering, pagination — handles 5k–20k rows from the revenue-model personas).
  Columns: Employee (name + BVN/NIN verified chip), Department, Risk Score (0–100 with `RiskBadge` ring), Flag Reason, Squad Status (`SquadPaymentGate` lock icon: red BLOCKED, amber HELD, green RELEASED), Manual Override toggle.
- Row expansion → **AI Evidence**: PDF snippet placeholder, mini `TransactionMap` (node graph showing employees sharing one account), conflicting transaction IDs.
- Conditional row styling: soft red background for high-risk rows.
- Sticky `FooterSummary`: Total Payroll · Flagged Savings · Verified count.
- Primary CTA: "Execute Verified Payments via Squad" (only fires for cleared rows).
- Right-side `RealTimeWebhookFeed`: live activity log (Transfer Released, Fraud Paused, Override Applied), simulating Squad webhooks.

**Placeholder Red-Flag logic** (configurable later, pitched as "Configurable AI"):
- Shared Account — multiple employees on same account
- Payday Pop-up — account opened <48h before payroll
- Ghost Jump — salary increase >20% with no promotion record
- Velocity Flag — duplicate payment in same cycle

## Page 4 — Audit Trail (`/audit`)

Compliance report: summary stats, per-employee decision log, printable layout (`window.print()` styled), CSV export stub. Branded as "Payroll Compliance Report" deliverable for the government client.

## Reusable Components

```
src/components/
  layout/        AppShell, Header, Footer
  wizard/        StepperHeader, ScopeStep, IngestStep, AnalyzeStep, ReviewStep, UploadDropzone, ScanAnimation
  ledger/        LedgerTable, RiskBadge, SquadPaymentGate, TransactionMap, RowEvidence, FooterSummary, FilterBar
  feed/          RealTimeWebhookFeed
  common/        StatCard, LogicBadge, SkeletonRow
```

## State & Mock Data

- `src/store/wizardStore.ts` — Zustand for wizard progress + uploaded file metadata.
- `src/store/ledgerStore.ts` — generated mock employees (~200 rows) seeded with all four red-flag patterns; deterministic so demo is repeatable.
- `src/lib/mockSquad.ts` — simulated webhook events on an interval feeding the live activity sidebar.

No backend in this pass — Lovable Cloud and real Squad API wiring deferred to follow-up prompts.

## Technical Notes

- React 19 + TanStack Start + Tailwind v4 (already configured).
- Add: `zustand`, `@tanstack/react-table`, `react-dropzone`. `lucide-react` already present.
- New tokens in `src/styles.css`: `--risk-low`, `--risk-medium`, `--risk-high`, `--squad-locked`, `--squad-held`, `--squad-released`, `--surface-elevated`, gradient + shadow tokens for the trust-centric look.
- Strict separation: presentation only; AI scoring + Squad calls stubbed behind clearly-named functions ready to swap for real integrations.

## Follow-Up Hooks (designed for iterative prompts)

The architecture is intentionally modular so you can later say:
- "Add a mobile camera scan modal in IngestStep."
- "Tint LedgerTable rows red when Flag Reason = 'Shared Account'."
- "Add an Audit Log entry on every Manual Override toggle."
- "Add `/analytics` route with a Recharts bar chart of savings per ministry."
- "Wire Lovable Cloud + real Squad Transfer API into mockSquad.ts."

## Out of Scope (this pass)

Real backend, auth, database, real Squad API calls, real PDF OCR — all stubbed with realistic deterministic mocks for the demo.
