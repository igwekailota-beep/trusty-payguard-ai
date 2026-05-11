import { createFileRoute } from "@tanstack/react-router";
import { LedgerTable } from "@/components/ledger/LedgerTable";
import { RealTimeWebhookFeed } from "@/components/feed/RealTimeWebhookFeed";
import { useLedgerStore } from "@/store/ledgerStore";
import { StatCard } from "@/components/common/StatCard";
import { naira, compactNaira } from "@/lib/format";
import { ShieldAlert, ShieldCheck, Users } from "lucide-react";
import { RED_FLAGS } from "@/lib/mockData";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Smart Decision Ledger · PayGuard AI" },
      { name: "description", content: "AI-gated payroll command center with live Squad webhook feed." },
      { property: "og:title", content: "PayGuard AI · Decision Ledger" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const employees = useLedgerStore((s) => s.employees);
  const flagged = employees.filter((e) => e.riskScore >= 70 && !e.override);
  const verified = employees.filter((e) => e.riskScore < 50 || e.override);
  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0);
  const savings = flagged.reduce((s, e) => s + e.salary, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Smart Decision Ledger</h1>
          <p className="text-sm text-muted-foreground">
            Every row is one Squad gate. Click to expand AI evidence.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          {employees.length} employees scanned · {flagged.length} flagged · {verified.length} cleared
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <StatCard
          label="Total Payroll"
          value={compactNaira(totalPayroll)}
          hint={naira(totalPayroll)}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Verified Workers"
          value={`${verified.length}`}
          hint="Cleared for Squad disbursement"
          tone="success"
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatCard
          label="Flagged Records"
          value={`${flagged.length}`}
          hint="Held by AI"
          tone="danger"
          icon={<ShieldAlert className="h-4 w-4" />}
        />
        <StatCard
          label="Savings Prevented"
          value={compactNaira(savings)}
          hint="Before money leaves the bank"
          tone="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <LedgerTable />
          <div className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-semibold">Configurable Red-Flags</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Each audit firm can tune these patterns. Defaults shown below.
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {RED_FLAGS.map((f) => (
                <li key={f.name} className="rounded-md border bg-background p-3">
                  <div className="text-sm font-medium">{f.name}</div>
                  <div className="text-xs text-muted-foreground">{f.description}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <RealTimeWebhookFeed />
      </div>
    </div>
  );
}
