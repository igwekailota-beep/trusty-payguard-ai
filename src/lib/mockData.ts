// Deterministic mock employee dataset for the Smart Decision Ledger.
export type FlagReason =
  | "Clean"
  | "Shared Account"
  | "Payday Pop-up"
  | "Ghost Jump"
  | "Velocity Flag";

export type SquadStatus = "RELEASED" | "HELD" | "BLOCKED";

export interface Employee {
  id: string;
  name: string;
  bvn: string;
  department: string;
  salary: number;
  account: string;
  riskScore: number;
  flagReason: FlagReason;
  squadStatus: SquadStatus;
  override: boolean;
  evidence: string[];
  accountAgeDays: number;
  prevSalary: number;
}

const FIRST = ["Adaeze","Chinedu","Tunde","Ifeoma","Bola","Kemi","Sade","Emeka","Yusuf","Aisha","Folake","Obinna","Hauwa","Segun","Ngozi","Musa","Tope","Ebere","Ahmed","Ronke","Femi","Halima","Chukwu","Bisi","Idris","Nneka","Lekan","Zainab","Uche","Damilola"];
const LAST = ["Okafor","Adeyemi","Ibrahim","Eze","Bello","Adekunle","Mohammed","Nwosu","Ogundimu","Lawal","Okonkwo","Hassan","Adebayo","Yakubu","Onyeka","Sani","Okeke","Garba"];
const DEPTS = ["Education","Health","Works","Finance","Agriculture","Transport","Justice","Secretariat"];

// simple seeded rng
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function deriveStatus(score: number, flag: FlagReason): SquadStatus {
  if (flag === "Clean" && score < 30) return "RELEASED";
  if (score >= 70) return "BLOCKED";
  return "HELD";
}

export function generateEmployees(count = 220): Employee[] {
  const rnd = mulberry32(42);
  const list: Employee[] = [];
  // Pre-seed a shared account ring (4 employees)
  const sharedAccount = "0123456789";

  for (let i = 0; i < count; i++) {
    const fi = Math.floor(rnd() * FIRST.length);
    const li = Math.floor(rnd() * LAST.length);
    const name = `${FIRST[fi]} ${LAST[li]}`;
    const dept = DEPTS[Math.floor(rnd() * DEPTS.length)];
    const salary = Math.round((80_000 + rnd() * 520_000) / 1000) * 1000;

    let flag: FlagReason = "Clean";
    let evidence: string[] = [];
    let account = String(1000000000 + Math.floor(rnd() * 8_999_999_999));
    let accountAgeDays = 30 + Math.floor(rnd() * 1500);
    let prevSalary = salary;
    let score = Math.floor(rnd() * 28);

    const r = rnd();
    if (i < 4) {
      flag = "Shared Account";
      account = sharedAccount;
      score = 78 + Math.floor(rnd() * 18);
      evidence = [
        `Account ${sharedAccount} linked to 4 distinct employee records`,
        `TX-IDs: TX-${1000 + i}, TX-${2000 + i}`,
        "Bank statement names do not match payroll roster",
      ];
    } else if (r < 0.06) {
      flag = "Payday Pop-up";
      accountAgeDays = Math.floor(rnd() * 2);
      score = 72 + Math.floor(rnd() * 20);
      evidence = [
        `Account opened ${accountAgeDays * 24}h before payroll cycle`,
        "No prior transaction history on bank statement",
        "Single inbound transfer expected (salary)",
      ];
    } else if (r < 0.12) {
      flag = "Ghost Jump";
      prevSalary = Math.round(salary * (0.5 + rnd() * 0.2));
      const jump = ((salary - prevSalary) / prevSalary) * 100;
      score = 65 + Math.floor(rnd() * 25);
      evidence = [
        `Salary increased ${jump.toFixed(1)}% in one cycle`,
        "No promotion record found in HR ledger",
        `Previous: ₦${prevSalary.toLocaleString()} → Current: ₦${salary.toLocaleString()}`,
      ];
    } else if (r < 0.16) {
      flag = "Velocity Flag";
      score = 60 + Math.floor(rnd() * 28);
      evidence = [
        "Duplicate payment detected within current cycle",
        `TX-IDs: TX-${5000 + i}-A, TX-${5000 + i}-B`,
        "Same beneficiary, same amount, < 24h apart",
      ];
    } else if (r < 0.32) {
      score = 30 + Math.floor(rnd() * 25);
    }

    list.push({
      id: `EMP-${String(10000 + i)}`,
      name,
      bvn: `2${Math.floor(rnd() * 10_000_000_000)}`.slice(0, 11),
      department: dept,
      salary,
      account,
      riskScore: score,
      flagReason: flag,
      squadStatus: deriveStatus(score, flag),
      override: false,
      evidence,
      accountAgeDays,
      prevSalary,
    });
  }
  return list;
}

export const RED_FLAGS: { name: FlagReason; description: string }[] = [
  { name: "Shared Account", description: "Multiple employees linked to one bank account." },
  { name: "Payday Pop-up", description: "Account opened less than 48 hours before payroll." },
  { name: "Ghost Jump", description: "Salary increase greater than 20% with no promotion record." },
  { name: "Velocity Flag", description: "Duplicate payment to the same beneficiary in one cycle." },
];
