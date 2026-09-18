import { createHash } from "node:crypto"
import { createServiceClient } from "@/lib/supabase/server"
import { buildProcurementGraph } from "@/lib/langgraph/graph"
import type { NormalizedOfferInput } from "@/lib/procurement/types"
import type { DecisionOutcome } from "@/lib/langgraph/state"

export type ProcessSourceResult = {
  duplicate: boolean
  eventKey: string
  sourceId: string
  outcomes: DecisionOutcome[]
  message: string
}

function hashSource(filename: string, rows: NormalizedOfferInput[]): string {
  return createHash("sha256")
    .update(filename + JSON.stringify(rows))
    .digest("hex")
}

/**
 * Entry point for both CSV upload and the "simulate supplier update" demo
 * trigger. Stores the source + normalized offers (skipped if this exact
 * content was already stored), then runs the LangGraph workflow, which is
 * itself responsible for not double-processing the same event.
 */
export async function processSupplierSource(params: {
  supplierId: string
  filename: string
  rows: NormalizedOfferInput[]
}): Promise<ProcessSourceResult> {
  const { supplierId, filename, rows } = params
  if (rows.length === 0) throw new Error("No rows to process")

  const db = createServiceClient()
  const contentHash = hashSource(filename, rows)
  const eventKey = `supplier_source_updated:${supplierId}:${contentHash}`

  const { data: existingSource } = await db
    .from("supplier_sources")
    .select("id")
    .eq("supplier_id", supplierId)
    .eq("content_hash", contentHash)
    .maybeSingle()

  let sourceId = existingSource?.id as string | undefined

  if (!sourceId) {
    const { data: latestVersion } = await db
      .from("supplier_sources")
      .select("version")
      .eq("supplier_id", supplierId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: newSource, error: sourceError } = await db
      .from("supplier_sources")
      .insert({
        supplier_id: supplierId,
        filename,
        version: (latestVersion?.version ?? 0) + 1,
        content_hash: contentHash,
        status: "processed",
      })
      .select("id")
      .single()
    if (sourceError) throw sourceError
    sourceId = newSource.id

    for (const row of rows) {
      const { data: product, error: productError } = await db
        .from("products")
        .upsert(
          { id: `product-${row.productCode.toLowerCase()}`, code: row.productCode, name: row.productName, unit: row.unit },
          { onConflict: "code" }
        )
        .select("id")
        .single()
      if (productError) throw productError

      const { error: offerError } = await db.from("supplier_offers").insert({
        supplier_id: supplierId,
        product_id: product.id,
        source_id: sourceId,
        source_row: row.sourceRow,
        quantity: row.quantity,
        unit_price: row.unitPrice,
        currency: row.currency,
      })
      if (offerError) throw offerError
    }
  }

  if (!sourceId) throw new Error("Failed to resolve supplier source id")

  const graph = buildProcurementGraph(db)
  const result = await graph.invoke({
    eventKey,
    eventType: "SUPPLIER_SOURCE_UPDATED",
    supplierId,
    sourceId,
  })

  return {
    duplicate: result.alreadyProcessed,
    eventKey,
    sourceId,
    outcomes: result.outcomes,
    message: result.alreadyProcessed
      ? "Event already processed. No changes applied."
      : "Supplier update processed.",
  }
}
