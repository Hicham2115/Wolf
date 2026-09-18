import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { canApprove } from "@/lib/procurement/approval-guard"
import { calculateTotal } from "@/lib/procurement/calculations"

/**
 * A buyer approval is only valid against the decision version they actually
 * saw. If the source changed again in the meantime (current_version moved
 * on), the approval is rejected rather than silently applied to stale data.
 *
 * The recommendation is advisory: a buyer can approve any supplier with a
 * current offer for this product, not only the one the system recommended.
 * The total for that choice is still calculated deterministically here —
 * never trusted from the client, never computed by the LLM.
 *
 * A version that hasn't been approved yet (REVIEW_REQUIRED) is still a
 * draft and can be finalized with the buyer's actual choice in place. Once
 * a version has been APPROVED or REJECTED it's historical evidence — a
 * later switch creates a new version rather than overwriting it.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const approvedBy: string = body.approvedBy ?? "Current buyer"
  const expectedVersion: number | undefined = body.expectedVersion
  const supplierId: string | undefined = body.supplierId

  const db = createServiceClient()
  const { data: decision, error } = await db
    .from("decisions")
    .select("id, product_id, status, current_version, recommended_supplier_id")
    .eq("id", id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!decision) return NextResponse.json({ error: `Decision "${id}" not found` }, { status: 404 })

  const guard = canApprove(decision, expectedVersion)
  if (!guard.ok) {
    return NextResponse.json({ error: guard.reason }, { status: 409 })
  }

  const approvedAt = new Date().toISOString()
  const isOverride = Boolean(supplierId) && supplierId !== decision.recommended_supplier_id
  const isNewVersion = decision.status !== "REVIEW_REQUIRED"
  const targetVersion = isNewVersion ? decision.current_version + 1 : decision.current_version

  const decisionUpdate: Record<string, unknown> = {
    status: "APPROVED",
    approved_at: approvedAt,
    approved_by: approvedBy,
    current_version: targetVersion,
    updated_at: approvedAt,
  }

  if (isOverride) {
    const { data: offerRow, error: offerError } = await db
      .from("supplier_offers")
      .select("supplier_id, source_id, source_row, quantity, unit_price, currency")
      .eq("product_id", decision.product_id)
      .eq("supplier_id", supplierId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (offerError) return NextResponse.json({ error: offerError.message }, { status: 500 })
    if (!offerRow) {
      return NextResponse.json(
        { error: "No current offer found for the chosen supplier." },
        { status: 400 }
      )
    }

    const quantity = Number(offerRow.quantity)
    const unitPrice = Number(offerRow.unit_price)
    const totalPrice = calculateTotal(quantity, unitPrice)

    Object.assign(decisionUpdate, {
      recommended_supplier_id: offerRow.supplier_id,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      currency: offerRow.currency,
      source_id: offerRow.source_id,
    })

    const versionFields = {
      supplier_id: offerRow.supplier_id,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      currency: offerRow.currency,
      source_id: offerRow.source_id,
    }

    if (isNewVersion) {
      // The version being switched away from is historical evidence —
      // leave it exactly as it was (already APPROVED/REJECTED) and record
      // the buyer's new choice as its own version.
      await db.from("decision_versions").insert({
        decision_id: id,
        version: targetVersion,
        status: "APPROVED",
        ...versionFields,
      })
    } else {
      // Still a draft recommendation — finalize it in place with what the
      // buyer actually chose.
      await db
        .from("decision_versions")
        .update(versionFields)
        .eq("decision_id", id)
        .eq("version", targetVersion)
    }

    await db.from("evidence").insert([
      {
        decision_id: id,
        decision_version: targetVersion,
        source_id: offerRow.source_id,
        source_row: offerRow.source_row,
        field_name: "unit_price",
        field_value: String(unitPrice),
      },
      {
        decision_id: id,
        decision_version: targetVersion,
        source_id: offerRow.source_id,
        source_row: offerRow.source_row,
        field_name: "quantity",
        field_value: String(quantity),
      },
    ])
  } else if (isNewVersion) {
    // Re-approving the same supplier on an already-decided decision still
    // gets its own version so the timeline stays truthful.
    const { data: currentVersionRow } = await db
      .from("decision_versions")
      .select("supplier_id, quantity, unit_price, total_price, currency, source_id")
      .eq("decision_id", id)
      .eq("version", decision.current_version)
      .maybeSingle()

    await db.from("decision_versions").insert({
      decision_id: id,
      version: targetVersion,
      status: "APPROVED",
      supplier_id: currentVersionRow?.supplier_id ?? decision.recommended_supplier_id,
      quantity: currentVersionRow?.quantity,
      unit_price: currentVersionRow?.unit_price,
      total_price: currentVersionRow?.total_price,
      currency: currentVersionRow?.currency,
      source_id: currentVersionRow?.source_id,
    })
  } else {
    await db
      .from("decision_versions")
      .update({ status: "APPROVED" })
      .eq("decision_id", id)
      .eq("version", targetVersion)
  }

  const { error: updateError } = await db.from("decisions").update(decisionUpdate).eq("id", id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  const { error: approvalError } = await db.from("approvals").insert({
    decision_id: id,
    decision_version: targetVersion,
    approved_by: isOverride ? `${approvedBy} (buyer override)` : approvedBy,
    approved_at: approvedAt,
    status: "APPROVED",
  })
  if (approvalError) return NextResponse.json({ error: approvalError.message }, { status: 500 })

  return NextResponse.json({ approved: true, approvedAt, approvedBy, override: isOverride })
}
