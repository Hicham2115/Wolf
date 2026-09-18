import { NextResponse } from "next/server"
import { getDecisionView } from "@/lib/procurement/get-decision-view"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const view = await getDecisionView(id)
  if (!view) {
    return NextResponse.json({ error: `Decision "${id}" not found` }, { status: 404 })
  }
  return NextResponse.json(view)
}
