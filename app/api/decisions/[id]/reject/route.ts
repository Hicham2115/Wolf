import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const rejectedBy: string = body.rejectedBy ?? "Current buyer"

  const db = createServiceClient()
  const { data: decision, error } = await db
    .from("decisions")
    .select("id, current_version")
    .eq("id", id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!decision) return NextResponse.json({ error: `Decision "${id}" not found` }, { status: 404 })

  const { error: approvalError } = await db.from("approvals").insert({
    decision_id: id,
    decision_version: decision.current_version,
    approved_by: rejectedBy,
    status: "REJECTED",
  })
  if (approvalError) return NextResponse.json({ error: approvalError.message }, { status: 500 })

  return NextResponse.json({ rejected: true })
}
