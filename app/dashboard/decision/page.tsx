import { getPrimaryDecisionId, getDecisionView } from "@/lib/procurement/get-decision-view"
import { DecisionClient } from "./decision-client"
import { DecisionEmptyState } from "./empty-state"

export const dynamic = "force-dynamic"

export default async function DecisionPage() {
  const decisionId = await getPrimaryDecisionId()
  if (!decisionId) return <DecisionEmptyState />

  const view = await getDecisionView(decisionId)
  if (!view) return <DecisionEmptyState />

  return <DecisionClient initial={view} />
}
