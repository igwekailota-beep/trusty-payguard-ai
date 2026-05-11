import { Fragment, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight, ChevronUp, ChevronsUpDown, ShieldCheck } from "lucide-react";
import { useLedgerStore } from "@/store/ledgerStore";
import { useFeedStore } from "@/store/feedStore";
import { naira } from "@/lib/format";
import type { Employee } from "@/lib/mockData";
import { RiskBadge } from "./RiskBadge";
import { SquadPaymentGate } from "./SquadPaymentGate";
import { TransactionMap } from "./TransactionMap";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function LedgerTable() {
  const employees = useLedgerStore((s) => s.employees);
  const setOverride = useLedgerStore((s) => s.setOverride);
  const execute = useLedgerStore((s) => s.executeVerifiedPayments);
  const pushFeed = useFeedStore((s) => s.push);

  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [dept, setDept] = useState<string>("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "riskScore", desc: true }]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))).sort(),
    [employees],
  );

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      if (search && !`${e.name} ${e.id} ${e.account}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (dept !== "all" && e.department !== dept) return false;
      if (risk === "low" && e.riskScore >= 30) return false;
      if (risk === "medium" && (e.riskScore < 30 || e.riskScore >= 70)) return false;
      if (risk === "high" && e.riskScore < 70) return false;
      if (status !== "all" && e.squadStatus !== status) return false;
      return true;
    });
  }, [employees, search, dept, risk, status]);

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        id: "expander",
        header: "",
        cell: ({ row }) => (
          <button
            onClick={() => setExpanded(expanded === row.original.id ? null : row.original.id)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Expand row"
          >
            {expanded === row.original.id ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ),
      },
      {
        accessorKey: "name",
        header: "Employee",
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              {row.original.name}
              <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--squad-released)]" aria-label="BVN verified" />
            </div>
            <div className="text-[11px] text-muted-foreground tabular-nums">
              {row.original.id} · BVN {row.original.bvn}
            </div>
          </div>
        ),
      },
      { accessorKey: "department", header: "Department" },
      {
        accessorKey: "riskScore",
        header: "Risk Score",
        cell: ({ row }) => <RiskBadge score={row.original.riskScore} />,
      },
      {
        accessorKey: "flagReason",
        header: "Flag Reason",
        cell: ({ row }) => (
          <span
            className={cn(
              "text-xs",
              row.original.flagReason === "Clean" ? "text-muted-foreground" : "font-medium",
            )}
          >
            {row.original.flagReason}
          </span>
        ),
      },
      {
        accessorKey: "salary",
        header: "Salary",
        cell: ({ row }) => <span className="tabular-nums text-sm">{naira(row.original.salary)}</span>,
      },
      {
        accessorKey: "squadStatus",
        header: "Squad Status",
        cell: ({ row }) => <SquadPaymentGate status={row.original.squadStatus} />,
      },
      {
        id: "override",
        header: "Override",
        cell: ({ row }) => (
          <Switch
            checked={row.original.override}
            onCheckedChange={(v) => {
              setOverride(row.original.id, v);
              if (v)
                pushFeed({
                  kind: "override",
                  message: `Auditor override applied · ${row.original.id}`,
                });
            }}
            aria-label="Manual override"
          />
        ),
      },
    ],
    [expanded, setOverride, pushFeed],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } },
  });

  const totalPayroll = employees.reduce((s, e) => s + e.salary, 0);
  const flaggedSavings = employees
    .filter((e) => e.riskScore >= 70 && !e.override)
    .reduce((s, e) => s + e.salary, 0);
  const verified = employees.filter((e) => e.riskScore < 50 || e.override).length;

  return (
    <div className="rounded-lg border bg-card shadow-[var(--shadow-card)]">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b p-3">
        <Input
          placeholder="Search name, ID, or account…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 w-full sm:w-64"
        />
        <Select value={dept} onValueChange={setDept}>
          <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={risk} onValueChange={setRisk}>
          <SelectTrigger className="h-9 w-32"><SelectValue placeholder="Risk" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All risk</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Squad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="RELEASED">Released</SelectItem>
            <SelectItem value="HELD">Held</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button
          onClick={() => {
            const n = execute();
            pushFeed({
              kind: "released",
              message: `Squad batch executed · ${n} verified payments released`,
            });
          }}
        >
          Execute Verified Payments via Squad
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const sortable = h.column.getCanSort() && h.column.id !== "expander" && h.column.id !== "override";
                  return (
                    <th key={h.id} className="px-3 py-2 font-medium">
                      {sortable ? (
                        <button
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={h.column.getToggleSortingHandler()}
                        >
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {h.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : h.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(h.column.columnDef.header, h.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const high = row.original.riskScore >= 70;
              const isExpanded = expanded === row.original.id;
              return (
                <Fragment key={row.id}>
                  <tr
                    className={cn(
                      "border-t transition-colors",
                      high ? "bg-[color-mix(in_oklab,var(--risk-high)_8%,transparent)]" : "hover:bg-muted/40",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {isExpanded && (
                    <tr className="border-t bg-muted/30">
                      <td colSpan={row.getVisibleCells().length} className="p-4">
                        <Evidence employee={row.original} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm text-muted-foreground">
                  No employees match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <div>
          {filtered.length} of {employees.length} employees
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <span className="tabular-nums">
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      {/* Footer summary (sticky-feel) */}
      <div className="grid gap-3 border-t bg-[var(--gradient-trust)] p-4 sm:grid-cols-3">
        <Summary label="Total Payroll" value={naira(totalPayroll)} />
        <Summary label="Flagged Savings (Prevented)" value={naira(flaggedSavings)} tone="danger" />
        <Summary label="Verified Workers" value={`${verified} / ${employees.length}`} tone="success" />
      </div>
    </div>
  );
}

function Summary({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "danger";
}) {
  const color =
    tone === "success" ? "var(--squad-released)" : tone === "danger" ? "var(--squad-locked)" : "var(--foreground)";
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function Evidence({ employee }: { employee: Employee }) {
  const all = useLedgerStore((s) => s.employees);
  const peers =
    employee.flagReason === "Shared Account"
      ? all.filter((e) => e.account === employee.account && e.id !== employee.id).slice(0, 4)
      : [];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          AI Evidence
        </h4>
        <ul className="space-y-1.5 text-sm">
          {(employee.evidence.length
            ? employee.evidence
            : ["No anomalies detected on this record."]
          ).map((line, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 rounded-md border bg-background p-3 font-mono text-[11px] text-muted-foreground">
          <div>// Bank statement excerpt (parsed by AI OCR)</div>
          <div>ACCT: {employee.account}</div>
          <div>NAME: {employee.name.toUpperCase()}</div>
          <div>OPENED: {employee.accountAgeDays} days ago</div>
          <div>EXPECTED CREDIT: ₦{employee.salary.toLocaleString()}</div>
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {peers.length ? "Account Sharing Map" : "Transaction Graph"}
        </h4>
        <div className="rounded-md border bg-background">
          <TransactionMap employee={employee} peers={peers} />
        </div>
      </div>
    </div>
  );
}
