import { getDecisionView } from "@/lib/procurement/get-decision-view"
import { DecisionClient } from "./decision-client"

export const dynamic = "force-dynamic"

const DECISION_ID = "DEC-0042"

export default async function DecisionPage() {
  const view = await getDecisionView(DECISION_ID)

  if (!view) {
    return (
      <div className="mx-auto max-w-4xl text-sm text-muted-foreground">
        Decision {DECISION_ID} not found. Run the Supabase migration and seed
        data, then reload this page.
      </div>
    )
  }

  return <DecisionClient initial={view} />
}
