import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"

export async function GET() {
  const db = createServiceClient()
  const { data, error } = await db
    .from("decisions")
    .select("id, status, recommended_supplier_id, total_price, currency, updated_at")
    .order("updated_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ decisions: data })
}
