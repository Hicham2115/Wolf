export type ApprovalGuardResult = { ok: true } | { ok: false; reason: string }

/**
 * A human approval is only valid against the decision version the buyer
 * actually reviewed. This is the deterministic rule that prevents an
 * approval from silently landing on outdated supplier data — the API route
 * enforces it against the database, this function is the reusable/testable
 * core of that rule.
 */
export function canApprove(
  decision: { status: string; current_version: number },
  expectedVersion: number | undefined
): ApprovalGuardResult {
  if (decision.status !== "STALE" && decision.status !== "REVIEW_REQUIRED") {
    return { ok: false, reason: "This decision is not awaiting approval." }
  }
  if (expectedVersion !== undefined && expectedVersion !== decision.current_version) {
    return {
      ok: false,
      reason: "This decision is no longer current. Please review the latest evidence.",
    }
  }
  return { ok: true }
}
