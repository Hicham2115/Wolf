import type { SupabaseClient } from "@supabase/supabase-js"
import type { ProcurementState } from "@/lib/langgraph/state"

export async function finalize(
  db: SupabaseClient,
  state: ProcurementState
): Promise<Partial<ProcurementState>> {
  await db
    .from("events")
    .update({
      status: "COMPLETED",
      processed_at: new Date().toISOString(),
      result: { outcomes: state.outcomes },
      decision_id: state.outcomes[0]?.decisionId ?? null,
    })
    .eq("event_key", state.eventKey)

  return {}
}
