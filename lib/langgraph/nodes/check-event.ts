import type { SupabaseClient } from "@supabase/supabase-js"
import type { ProcurementState } from "@/lib/langgraph/state"

/**
 * Idempotency gate. If an event with this key was already completed,
 * the graph must not recalculate or persist anything again.
 */
export async function checkEvent(
  db: SupabaseClient,
  state: ProcurementState
): Promise<Partial<ProcurementState>> {
  const { data: existing } = await db
    .from("events")
    .select("id, status")
    .eq("event_key", state.eventKey)
    .maybeSingle()

  if (existing && existing.status === "COMPLETED") {
    return { alreadyProcessed: true }
  }

  if (!existing) {
    await db.from("events").insert({
      event_type: state.eventType,
      event_key: state.eventKey,
      source_id: state.sourceId,
      status: "PROCESSING",
      payload: { supplierId: state.supplierId, sourceId: state.sourceId },
    })
  } else {
    await db.from("events").update({ status: "PROCESSING" }).eq("id", existing.id)
  }

  return { alreadyProcessed: false }
}
