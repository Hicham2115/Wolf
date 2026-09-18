import type { SupabaseClient } from "@supabase/supabase-js"
import { compareOffers, buildRecommendation } from "@/lib/procurement/calculations"
import type { SupplierOfferRow } from "@/lib/procurement/types"
import type { ProcurementState, DecisionOutcome } from "@/lib/langgraph/state"

/**
 * For each affected decision: load the latest offer per supplier for that
 * product, compare them, and produce a fresh recommendation. Nothing here
 * is persisted yet — that happens in the next node.
 */
export async function recalculate(
  db: SupabaseClient,
  state: ProcurementState
): Promise<Partial<ProcurementState>> {
  const outcomes: DecisionOutcome[] = []

  for (const decisionId of state.affectedDecisionIds) {
    const { data: decision, error: decisionError } = await db
      .from("decisions")
      .select("id, product_id, recommended_supplier_id, unit_price, total_price, current_version, status")
      .eq("id", decisionId)
      .single()
    if (decisionError) throw decisionError

    const { data: offerRows, error: offersError } = await db
      .from("supplier_offers")
      .select("supplier_id, product_id, source_id, source_row, quantity, unit_price, currency, created_at, suppliers(name)")
      .eq("product_id", decision.product_id)
      .order("created_at", { ascending: false })
    if (offersError) throw offersError

    const latestPerSupplier = new Map<string, (typeof offerRows)[number]>()
    for (const row of offerRows ?? []) {
      if (!latestPerSupplier.has(row.supplier_id)) latestPerSupplier.set(row.supplier_id, row)
    }

    const offers: SupplierOfferRow[] = [...latestPerSupplier.values()].map((row) => ({
      supplierId: row.supplier_id,
      supplierName: (row.suppliers as unknown as { name: string } | null)?.name ?? row.supplier_id,
      productId: row.product_id,
      sourceId: row.source_id,
      sourceRow: row.source_row,
      quantity: Number(row.quantity),
      unitPrice: Number(row.unit_price),
      currency: row.currency,
    }))

    const compared = compareOffers(offers, decision.recommended_supplier_id ?? undefined)
    const recommendation = buildRecommendation(compared)

    const changed =
      recommendation !== null &&
      (recommendation.supplierId !== decision.recommended_supplier_id ||
        recommendation.totalPrice !== Number(decision.total_price))

    outcomes.push({
      decisionId: decision.id,
      productId: decision.product_id,
      changed,
      status: changed ? "REVIEW_REQUIRED" : "UNCHANGED",
      invalidatesApprovedVersion: changed && decision.status === "APPROVED",
      previousVersion: decision.current_version,
      previousSupplierId: decision.recommended_supplier_id,
      previousTotal: decision.total_price === null ? null : Number(decision.total_price),
      previousUnitPrice: decision.unit_price === null ? null : Number(decision.unit_price),
      recommendation,
      explanation: null,
      version: decision.current_version + (changed ? 1 : 0),
    })
  }

  return { outcomes }
}
