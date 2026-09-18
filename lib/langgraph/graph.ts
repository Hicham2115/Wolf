import { StateGraph, START, END } from "@langchain/langgraph"
import type { SupabaseClient } from "@supabase/supabase-js"
import { ProcurementAnnotation } from "@/lib/langgraph/state"
import { checkEvent } from "@/lib/langgraph/nodes/check-event"
import { loadAffectedDecisions } from "@/lib/langgraph/nodes/load-context"
import { recalculate } from "@/lib/langgraph/nodes/recalculate"
import { explain } from "@/lib/langgraph/nodes/explain"
import { persistDecisions } from "@/lib/langgraph/nodes/persist-decision"
import { finalize } from "@/lib/langgraph/nodes/finalize"

/**
 * SUPPLIER_SOURCE_UPDATED workflow:
 *
 *   START -> checkEvent -> [alreadyProcessed? -> END]
 *                        -> loadAffectedDecisions -> recalculate
 *                        -> persistDecisions -> finalize -> END
 *
 * The graph never approves anything itself — it stops at STALE /
 * REVIEW_REQUIRED and waits for a human buyer via the approve API route.
 */
export function buildProcurementGraph(db: SupabaseClient) {
  const graph = new StateGraph(ProcurementAnnotation)
    .addNode("checkEvent", (state) => checkEvent(db, state))
    .addNode("loadAffectedDecisions", (state) => loadAffectedDecisions(db, state))
    .addNode("recalculate", (state) => recalculate(db, state))
    .addNode("explain", (state) => explain(db, state))
    .addNode("persistDecisions", (state) => persistDecisions(db, state))
    .addNode("finalize", (state) => finalize(db, state))
    .addEdge(START, "checkEvent")
    .addConditionalEdges("checkEvent", (state) =>
      state.alreadyProcessed ? END : "loadAffectedDecisions"
    )
    .addEdge("loadAffectedDecisions", "recalculate")
    .addEdge("recalculate", "explain")
    .addEdge("explain", "persistDecisions")
    .addEdge("persistDecisions", "finalize")
    .addEdge("finalize", END)

  return graph.compile()
}
