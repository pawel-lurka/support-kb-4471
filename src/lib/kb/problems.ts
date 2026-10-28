// What #4471 holds once it is split: one problem per fix. Counts follow the desk's own view
// (causes.ts, as CauseTable shows it): a report is counted under the cause its tenant files it
// under. The reports the desk read as a one-day move (desk-notes.json) are no month/day swap, so
// they get a problem of their own, and stay counted where they're filed, footnoted under it.
import { groupByCause, readAs, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day' | 'unplaced';

export type ProblemGroup = {
  problem: Problem;
  reports: number;
  // For a problem the desk files under another cause: that cause.
  filedUnder: Problem | null;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function groupByProblem(
  reports: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const merged = uniqueById(reports).filter((r) => r.mergedInto === ticket);
  const groups: ProblemGroup[] = groupByCause(merged, tenantOf).map((g) => ({
    problem: g.cause,
    reports: g.reports.length,
    filedUnder: null,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
  }));
  for (const g of groupByCause(merged, tenantOf)) {
    if (!readAs(g, oneDayMove)) continue;
    const moved = g.reports.filter((r) => oneDayMove.includes(r.id));
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    groups.push({
      problem: 'one-day',
      reports: moved.length,
      filedUnder: g.cause,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
    });
  }
  return groups;
}

// Reports in the ticket, each once.
export function totalReports(reports: Report[], ticket: number): number {
  return uniqueById(reports).filter((r) => r.mergedInto === ticket).length;
}
