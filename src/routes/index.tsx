import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileSearch,
  Lock,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PayGuard AI — Stop payroll fraud before it leaves the bank" },
      {
        name: "description",
        content:
          "AI + Squad-locked disbursement for Nigerian audit firms. Detect ghost workers in seconds, not months.",
      },
      { property: "og:title", content: "PayGuard AI" },
      { property: "og:description", content: "Smart payroll trust infrastructure." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden text-white"
        style={{ backgroundImage: "var(--gradient-hero)" }}
      >
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.2) 0, transparent 50%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Built on the Squad Transfer API
          </div>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Stop payroll fraud <span className="opacity-80">before</span> the money leaves the bank.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-white/80 md:text-lg">
            PayGuard AI reads bank statements, cross-references transaction IDs and locks the Squad
            disbursement gate the moment our model spots a ghost worker. A 6-month audit, finished
            in 6 seconds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/wizard">
                Start a Pre-Flight audit <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link to="/dashboard">View live demo ledger</Link>
            </Button>
          </div>
          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/20 pt-6 text-sm">
            <Stat n="₦20M+" label="prevented per state cycle" />
            <Stat n="6 sec" label="vs 6-month manual audit" />
            <Stat n="100%" label="AI-gated Squad transfers" />
          </dl>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">A smart financial gatekeeper</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every Squad payout passes through three checkpoints. If the AI fails any one, the gate
          stays locked and the money stays put.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Pillar
            icon={<FileSearch className="h-5 w-5" />}
            title="1 · Ingest"
            body="Drop bank statement PDFs and payroll CSVs — or scan with your phone camera in the field."
          />
          <Pillar
            icon={<Zap className="h-5 w-5" />}
            title="2 · Analyze"
            body="The AI surfaces shared accounts, payday-popup accounts, ghost salary jumps and duplicate transfers."
          />
          <Pillar
            icon={<Lock className="h-5 w-5" />}
            title="3 · Disburse"
            body="Squad releases funds only for cleared workers. Flagged records stay locked, with full audit trail."
          />
        </div>
      </section>

      {/* Lock diagram */}
      <section className="bg-[var(--gradient-trust)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                The AI and the payment are locked together.
              </h2>
              <p className="mt-3 text-muted-foreground">
                Most systems tell you a ghost worker was paid yesterday — information after death.
                PayGuard AI uses the Squad Transfer API as a live financial gate. If the model flags
                a risk above threshold, the transfer programmatically cannot fire.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "No biometrics required — works with bad internet & low-end phones.",
                  "Cross-references BVN, Transaction IDs and bank statement OCR.",
                  "Webhooks stream every Held / Released / Blocked event in real time.",
                  "Configurable red-flags per audit firm or ministry.",
                ].map((b) => (
                  <li key={b} className="flex gap-2">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--squad-released)]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-elegant)]">
              <div className="grid gap-3">
                <Row icon="ai" name="EMP-10042 · Adaeze O." status="Risk 18" tone="success" right="Squad: RELEASED" />
                <Row icon="ai" name="EMP-10118 · Tunde I." status="Risk 74" tone="danger" right="Squad: BLOCKED" />
                <Row icon="ai" name="EMP-10067 · Kemi A." status="Risk 22" tone="success" right="Squad: RELEASED" />
                <Row icon="ai" name="EMP-10204 · Bola N." status="Payday Pop-up · 88" tone="danger" right="Squad: BLOCKED" />
              </div>
              <div className="mt-5 flex items-center justify-between rounded-md border bg-background p-3 text-xs text-muted-foreground">
                <div>2 transfers approved</div>
                <div className="font-medium text-[color:var(--squad-locked)]">
                  2 transfers held by AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 text-center">
        <Wallet className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          Ready to clear your next payroll cycle?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Walk through the 4-step Pre-Flight wizard. Upload your data, watch the AI verify, and
          authorize Squad in one click.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link to="/wizard">Start Pre-Flight <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </section>
    </>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <dt className="text-2xl font-semibold tabular-nums">{n}</dt>
      <dd className="text-xs uppercase tracking-wider text-white/70">{label}</dd>
    </div>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-elegant)]">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Row({
  name,
  status,
  right,
  tone,
}: {
  icon: "ai";
  name: string;
  status: string;
  right: string;
  tone: "success" | "danger";
}) {
  const color = tone === "success" ? "var(--squad-released)" : "var(--squad-locked)";
  return (
    <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{status}</div>
      </div>
      <span
        className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
        style={{
          background: `color-mix(in oklab, ${color} 14%, transparent)`,
          color,
        }}
      >
        {right}
      </span>
    </div>
  );
}
