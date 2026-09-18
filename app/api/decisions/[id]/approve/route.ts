import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

/**
 * A buyer approval is only valid against the decision version they actually
 * saw. If the source changed again in the meantime (current_version moved
 * on), the approval is rejected rather than silently applied to stale data.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const approvedBy: string = body.approvedBy ?? "Current buyer"
  const expectedVersion: number | undefined = body.expectedVersion

  const db = createServiceClient()
  const { data: decision, error } = await db
    .from("decisions")
    .select("id, status, current_version")
    .eq("id", id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!decision) return NextResponse.json({ error: `Decision "${id}" not found` }, { status: 404 })

  if (decision.status !== "STALE" && decision.status !== "REVIEW_REQUIRED") {
    return NextResponse.json(
      { error: "This decision is not awaiting approval." },
      { status: 409 }
    )
  }

  if (expectedVersion !== undefined && expectedVersion !== decision.current_version) {
    return NextResponse.json(
      {
        error:
          "This decision is no longer current. Please review the latest evidence.",
      },
      { status: 409 }
    )
  }

  const approvedAt = new Date().toISOString()

  const { error: updateError } = await db
    .from("decisions")
    .update({ status: "APPROVED", approved_at: approvedAt, approved_by: approvedBy, updated_at: approvedAt })
    .eq("id", id)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  const { error: approvalError } = await db.from("approvals").insert({
    decision_id: id,
    decision_version: decision.current_version,
    approved_by: approvedBy,
    approved_at: approvedAt,
    status: "APPROVED",
  })
  if (approvalError) return NextResponse.json({ error: approvalError.message }, { status: 500 })

  return NextResponse.json({ approved: true, approvedAt, approvedBy })
}
