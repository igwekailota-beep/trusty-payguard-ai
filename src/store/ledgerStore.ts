import { create } from "zustand";
import { generateEmployees, type Employee, type SquadStatus } from "@/lib/mockData";

interface LedgerState {
  employees: Employee[];
  setOverride: (id: string, value: boolean) => void;
  setStatus: (id: string, status: SquadStatus) => void;
  executeVerifiedPayments: () => number;
}

export const useLedgerStore = create<LedgerState>((set, get) => ({
  employees: generateEmployees(220),
  setOverride: (id, value) =>
    set((s) => ({
      employees: s.employees.map((e) =>
        e.id === id
          ? {
              ...e,
              override: value,
              squadStatus: value ? "HELD" : e.squadStatus === "HELD" ? "BLOCKED" : e.squadStatus,
            }
          : e,
      ),
    })),
  setStatus: (id, status) =>
    set((s) => ({ employees: s.employees.map((e) => (e.id === id ? { ...e, squadStatus: status } : e)) })),
  executeVerifiedPayments: () => {
    const cleared = get().employees.filter((e) => e.riskScore < 50 || e.override);
    set((s) => ({
      employees: s.employees.map((e) =>
        e.riskScore < 50 || e.override ? { ...e, squadStatus: "RELEASED" as SquadStatus } : e,
      ),
    }));
    return cleared.length;
  },
}));
