import { Annotation } from "@langchain/langgraph"
import type { Recommendation } from "@/lib/procurement/types"

export type DecisionOutcome = {
  decisionId: string
  productId: string
  changed: boolean
  /** The new version's status — always REVIEW_REQUIRED when something changed. */
  status: "REVIEW_REQUIRED" | "UNCHANGED"
  /** True if the version being superseded was APPROVED, so it should be marked STALE. */
  invalidatesApprovedVersion: boolean
  previousVersion: number
  previousSupplierId: string | null
  previousTotal: number | null
  previousUnitPrice: number | null
  recommendation: Recommendation | null
  explanation: string | null
  version: number
}

export const ProcurementAnnotation = Annotation.Root({
  eventKey: Annotation<string>,
  eventType: Annotation<string>,
  supplierId: Annotation<string>,
  sourceId: Annotation<string>,
  alreadyProcessed: Annotation<boolean>({ default: () => false, reducer: (_prev, next) => next }),
  affectedDecisionIds: Annotation<string[]>({ default: () => [], reducer: (_prev, next) => next }),
  outcomes: Annotation<DecisionOutcome[]>({ default: () => [], reducer: (_prev, next) => next }),
  error: Annotation<string | undefined>({ default: () => undefined, reducer: (_prev, next) => next }),
})

export type ProcurementState = typeof ProcurementAnnotation.State
