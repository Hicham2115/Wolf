import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProcurementState } from "@/lib/langgraph/state";

/**
 * Writes the outcomes of recalculate(). An approved decision is historical
 * evidence and is never silently overwritten: the old version is marked
 * STALE, a new version is created as REVIEW_REQUIRED, and evidence points
 * back to the source row the new numbers came from.
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

    if (outcome.invalidatesApprovedVersion) {
      await db
        .from("decision_versions")
        .update({ status: "STALE" })
        .eq("decision_id", outcome.decisionId)
        .eq("version", outcome.previousVersion);
    }

    await db
      .from("decisions")
      .update({
        recommended_supplier_id: rec.supplierId,
        quantity: rec.quantity,
        unit_price: rec.unitPrice,
        total_price: rec.totalPrice,
        currency: rec.currency,
        status: outcome.status,
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
      status: outcome.status,
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
        {
          decision_id: outcome.decisionId,
          decision_version: outcome.version,
          source_id: offerRow.source_id,
          source_row: offerRow.source_row,
          field_name: "currency",
          field_value: rec.currency,
        },
      ]);
    }
  }

  return {};
}
