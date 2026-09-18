import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

/**
 * Clears the audit trail for a decision: processing events, approval log,
 * and every recalculation (decision_versions + evidence) except the current
 * version — that one stays so the evidence/explanation panel keeps working.
 */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createServiceClient()

  const { data: decision, error: findError } = await db
    .from("decisions")
    .select("id, current_version")
    .eq("id", id)
    .maybeSingle()
  if (findError) return NextResponse.json({ error: findError.message }, { status: 500 })
  if (!decision) return NextResponse.json({ error: `Decision "${id}" not found` }, { status: 404 })

  const { error: eventsError } = await db.from("events").delete().eq("decision_id", id)
  if (eventsError) return NextResponse.json({ error: eventsError.message }, { status: 500 })

  const { error: approvalsError } = await db.from("approvals").delete().eq("decision_id", id)
  if (approvalsError) return NextResponse.json({ error: approvalsError.message }, { status: 500 })

  const { error: evidenceError } = await db
    .from("evidence")
    .delete()
    .eq("decision_id", id)
    .neq("decision_version", decision.current_version)
  if (evidenceError) return NextResponse.json({ error: evidenceError.message }, { status: 500 })

  const { error: versionsError } = await db
    .from("decision_versions")
    .delete()
    .eq("decision_id", id)
    .neq("version", decision.current_version)
  if (versionsError) return NextResponse.json({ error: versionsError.message }, { status: 500 })

  return NextResponse.json({ cleared: true })
}
