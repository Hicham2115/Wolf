import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProcurementState } from "@/lib/langgraph/state";

/**
 * Writes the outcomes of recalculate(): marks changed decisions STALE with
 * their new recommendation, records a decision_versions snapshot, and logs
 * evidence pointing back to the source row the new numbers came from.
 */
export async function persistDecisions(
  db: SupabaseClient,
  state: ProcurementState,
): Promise<Partial<ProcurementState>> {
  for (const outcome of state.outcomes) {
    if (!outcome.changed || !outcome.recommendation) continue;
    const rec = outcome.recommendation;

    const { data: offerRow } = await db
      .from("supplier_offers")
      .select("id, source_id, source_row")
      .eq("product_id", outcome.productId)
      .eq("supplier_id", rec.supplierId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    await db
      .from("decisions")
      .update({
        recommended_supplier_id: rec.supplierId,
        quantity: rec.quantity,
        unit_price: rec.unitPrice,
        total_price: rec.totalPrice,
        currency: rec.currency,
        status: "STALE",
        current_version: outcome.version,
        source_id: offerRow?.source_id ?? state.sourceId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", outcome.decisionId);

    await db.from("decision_versions").insert({
      decision_id: outcome.decisionId,
      version: outcome.version,
      supplier_id: rec.supplierId,
      quantity: rec.quantity,
      unit_price: rec.unitPrice,
      total_price: rec.totalPrice,
      currency: rec.currency,
      status: "STALE",
      source_id: offerRow?.source_id ?? state.sourceId,
      explanation: outcome.explanation,
    });

    if (offerRow) {
      await db.from("evidence").insert([
        {
          decision_id: outcome.decisionId,
          decision_version: outcome.version,
          source_id: offerRow.source_id,
          source_row: offerRow.source_row,
          field_name: "unit_price",
          field_value: String(rec.unitPrice),
        },
        {
          decision_id: outcome.decisionId,
          decision_version: outcome.version,
          source_id: offerRow.source_id,
          source_row: offerRow.source_row,
          field_name: "quantity",
          field_value: String(rec.quantity),
        },
      ]);
    }
  }

  return {};
}
