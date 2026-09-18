export type ApprovalGuardResult = { ok: true } | { ok: false; reason: string }

/**
 * A human approval is only valid against the decision version the buyer
 * actually reviewed. This is the deterministic rule that prevents an
 * approval from silently landing on outdated supplier data — the API route
 * enforces it against the database, this function is the reusable/testable
 * core of that rule.
 *
 * The buyer can approve (or switch to) any supplier at any time — the
 * system's recommendation is advisory, not binding. The only hard
 * requirement is that they're acting on the current version of the
 * decision, not a stale page they had open.
 */
export function canApprove(
  decision: { current_version: number },
  expectedVersion: number | undefined
): ApprovalGuardResult {
  if (expectedVersion !== undefined && expectedVersion !== decision.current_version) {
    return {
      ok: false,
      reason: "This decision is no longer current. Please review the latest evidence.",
    }
  }
  return { ok: true }
}
