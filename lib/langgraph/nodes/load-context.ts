import type { SupabaseClient } from "@supabase/supabase-js"
import type { ProcurementState } from "@/lib/langgraph/state"

/**
 * Finds which decisions are affected by the new source: only decisions
 * for products that appear in this source's offers get recalculated.
 */
export async function loadAffectedDecisions(
  db: SupabaseClient,
  state: ProcurementState
): Promise<Partial<ProcurementState>> {
  const { data: newOffers, error: offersError } = await db
    .from("supplier_offers")
    .select("product_id")
    .eq("source_id", state.sourceId)

  if (offersError) throw offersError

  const productIds = [...new Set((newOffers ?? []).map((o) => o.product_id))]
  if (productIds.length === 0) return { affectedDecisionIds: [] }

  const { data: decisions, error: decisionsError } = await db
    .from("decisions")
    .select("id")
    .in("product_id", productIds)

  if (decisionsError) throw decisionsError

  return { affectedDecisionIds: (decisions ?? []).map((d) => d.id) }
}
