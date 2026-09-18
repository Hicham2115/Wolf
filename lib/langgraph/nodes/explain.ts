import type { SupabaseClient } from "@supabase/supabase-js"
import { generateExplanation } from "@/lib/ai/generate-explanation"
import type { ProcurementState, DecisionOutcome } from "@/lib/langgraph/state"

/**
 * Turns each changed outcome's already-computed numbers into a short
 * human-readable sentence. Purely descriptive — every figure it uses was
 * calculated in recalculate(), never by the model itself.
 */
export async function explain(
  db: SupabaseClient,
  state: ProcurementState
): Promise<Partial<ProcurementState>> {
  const outcomes: DecisionOutcome[] = []

  for (const outcome of state.outcomes) {
    if (!outcome.changed || !outcome.recommendation || outcome.previousTotal === null || outcome.previousUnitPrice === null) {
      outcomes.push(outcome)
      continue
    }

    let previousSupplierName = outcome.previousSupplierId ?? "the previous supplier"
    if (outcome.previousSupplierId) {
      const { data: supplier } = await db
        .from("suppliers")
        .select("name")
        .eq("id", outcome.previousSupplierId)
        .maybeSingle()
      if (supplier) previousSupplierName = supplier.name
    }

    const rec = outcome.recommendation
    const explanation = await generateExplanation({
      previousSupplier: previousSupplierName,
      previousUnitPrice: outcome.previousUnitPrice,
      previousTotal: outcome.previousTotal,
      recommendedSupplier: rec.supplierName,
      recommendedUnitPrice: rec.unitPrice,
      recommendedTotal: rec.totalPrice,
      currency: rec.currency,
      saving:
        outcome.previousTotal > rec.totalPrice
          ? Math.round((outcome.previousTotal - rec.totalPrice) * 100) / 100
          : null,
    })

    outcomes.push({ ...outcome, explanation })
  }

  return { outcomes }
}
