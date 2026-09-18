import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { buildProcurementGraph } from "@/lib/langgraph/graph"

/**
 * Replays the most recent event through the same graph. Because the event
 * is already marked COMPLETED, checkEvent short-circuits the graph and no
 * decision or evidence is touched again.
 */
export async function POST() {
  try {
    const db = createServiceClient()
    const { data: latest, error } = await db
      .from("events")
      .select("event_key, event_type, source_id, payload")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error

    if (!latest) {
      return NextResponse.json({ error: "No events to replay" }, { status: 404 })
    }

    const graph = buildProcurementGraph(db)
    const result = await graph.invoke({
      eventKey: latest.event_key,
      eventType: latest.event_type,
      supplierId: (latest.payload as { supplierId?: string } | null)?.supplierId ?? "",
      sourceId: latest.source_id ?? "",
    })

    return NextResponse.json({
      processed: true,
      duplicate: result.alreadyProcessed,
      message: result.alreadyProcessed
        ? "Event already processed. No changes applied."
        : "Event reprocessed.",
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Replay failed" },
      { status: 400 }
    )
  }
}
