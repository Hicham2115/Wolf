import { createServiceClient } from "@/lib/supabase/server"
import type { DashboardMetrics } from "@/lib/procurement/types"

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const db = createServiceClient()
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

  const [{ data }, { count }] = await Promise.all([
    db.from("decisions").select("status, approved_at, current_version"),
    // Counts individual approval events (from the audit log), not decisions
    // currently sitting in APPROVED status — a decision that goes stale and
    // gets re-approved should count twice, not overwrite the first approval.
    db
      .from("approvals")
      .select("id", { count: "exact", head: true })
      .eq("status", "APPROVED")
      .gte("approved_at", monthStart),
  ])
  const rows = data ?? []
  const approvedThisMonth = count ?? 0

  return {
    openDecisions: rows.filter((row) => row.status !== "REJECTED").length,
    awaitingApproval: rows.filter((row) => row.status === "REVIEW_REQUIRED").length,
    // A decision whose current version isn't its first means an earlier
    // (once-approved) version was invalidated by new supplier data.
    staleDecisions: rows.filter((row) => row.status === "REVIEW_REQUIRED" && row.current_version > 1).length,
    approvedThisMonth,
  }
}
