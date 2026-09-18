import { createServiceClient } from "@/lib/supabase/server"
import type { DashboardMetrics } from "@/lib/procurement/types"

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const db = createServiceClient()
  const { data } = await db.from("decisions").select("status, approved_at, current_version")
  const rows = data ?? []

  const now = new Date()
  const approvedThisMonth = rows.filter((row) => {
    if (row.status !== "APPROVED" || !row.approved_at) return false
    const approvedAt = new Date(row.approved_at)
    return (
      approvedAt.getUTCFullYear() === now.getUTCFullYear() &&
      approvedAt.getUTCMonth() === now.getUTCMonth()
    )
  }).length

  return {
    openDecisions: rows.filter((row) => row.status !== "REJECTED").length,
    awaitingApproval: rows.filter((row) => row.status === "REVIEW_REQUIRED").length,
    // A decision whose current version isn't its first means an earlier
    // (once-approved) version was invalidated by new supplier data.
    staleDecisions: rows.filter((row) => row.status === "REVIEW_REQUIRED" && row.current_version > 1).length,
    approvedThisMonth,
  }
}
