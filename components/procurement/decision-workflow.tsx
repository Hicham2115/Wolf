import {
  BellRing,
  Calculator,
  Check,
  ChevronDown,
  Circle,
  FileUp,
  Lightbulb,
  ShieldCheck,
  TriangleAlert,
  UserRoundCheck,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { DecisionView } from "@/lib/procurement/get-decision-view"

type WorkflowState = "complete" | "current" | "pending" | "skipped"

type WorkflowStep = {
  label: string
  icon: typeof FileUp
  state: WorkflowState
}

function getSteps(status: DecisionView["status"]): WorkflowStep[] {
  const isApproved = status === "approved"
  const isStale = status === "stale"

  return [
    { label: "Supplier update", icon: FileUp, state: "complete" },
    { label: "Event detected", icon: BellRing, state: "complete" },
    { label: "Recalculated", icon: Calculator, state: "complete" },
    { label: "Decision stale", icon: TriangleAlert, state: isStale ? "complete" : "skipped" },
    { label: "Recommendation", icon: Lightbulb, state: "complete" },
    { label: "Buyer review", icon: UserRoundCheck, state: isStale ? "current" : isApproved ? "complete" : "current" },
    { label: "Approved", icon: ShieldCheck, state: isApproved ? "current" : "pending" },
  ]
}

const stateClass: Record<WorkflowState, string> = {
  complete: "border-green-500/40 bg-green-500/10 text-green-500",
  current: "border-warning/70 bg-warning/10 text-warning",
  pending: "border-border bg-muted/30 text-muted-foreground",
  skipped: "border-border bg-muted/20 text-muted-foreground/60",
}

const stateLabel: Record<WorkflowState, string> = {
  complete: "Completed",
  current: "Current step",
  pending: "Pending",
  skipped: "Not required",
}

export function DecisionWorkflow({ status }: { status: DecisionView["status"] }) {
  const steps = getSteps(status)

  return (
    <Card size="sm" className="py-4">
      <CardContent className="px-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Decision workflow</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">How supplier updates move through this decision.</p>
          </div>
          <span className="text-xs font-medium text-muted-foreground">Current status: {status}</span>
        </div>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7 lg:gap-1">
          {steps.map((step) => {
            const Icon = step.icon
            const StateIcon = step.state === "complete" ? Check : step.state === "current" ? Circle : null
            return (
              <li key={step.label} className="relative min-w-0 lg:after:absolute lg:after:top-5 lg:after:left-[calc(50%+1.65rem)] lg:after:h-px lg:after:w-[calc(100%-2.3rem)] lg:after:bg-border lg:last:after:hidden">
                <div className="flex min-h-16 items-center gap-2 border border-border bg-background/30 p-2 lg:flex-col lg:items-start lg:gap-1">
                  <div className={`grid size-6 shrink-0 place-items-center rounded-full border ${stateClass[step.state]}`}>
                    {StateIcon ? <StateIcon className="size-3" fill={step.state === "current" ? "currentColor" : "none"} /> : <Icon className="size-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{step.label}</p>
                    <p className="text-[11px] text-muted-foreground">{stateLabel[step.state]}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

export function DecisionHowItWorks() {
  const items = [
    ["Supplier data", "A supplier CSV is imported and stored as a versioned source."],
    ["Event detection", "The system creates an event for the supplier update and checks whether it has already been processed."],
    ["Deterministic recalculation", "Affected offers are recalculated using application code. The LLM does not calculate prices or choose the supplier."],
    ["Recommendation", "The system compares valid supplier offers and identifies the lowest valid total."],
    ["Evidence", "The decision is linked to its source file, version, row, and relevant field values."],
    ["Human approval", "If an approved decision is no longer valid, it becomes stale and requires an explicit buyer approval or rejection."],
  ]

  return (
    <details className="group border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
        How it works
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border px-4 pb-4 pt-4">
        <ol className="space-y-3">
          {items.map(([title, description], index) => <li key={title} className="grid grid-cols-[1.5rem_1fr] gap-2"><span className="grid size-6 place-items-center rounded-full border border-border text-xs font-semibold text-muted-foreground">{index + 1}</span><div><h3 className="text-sm font-medium">{title}</h3><p className="mt-0.5 text-sm leading-5 text-muted-foreground">{description}</p></div></li>)}
        </ol>
        <p className="mt-4 border-l-2 border-info pl-3 text-sm leading-5 text-muted-foreground"><span className="font-medium text-foreground">AI is used only to explain the calculated result.</span> Financial calculations and supplier selection are deterministic.</p>
        <p className="mt-4 text-xs text-muted-foreground">CSV <span aria-hidden="true">→</span> Supabase <span aria-hidden="true">→</span> LangGraph <span aria-hidden="true">→</span> Deterministic calculation <span aria-hidden="true">→</span> Evidence <span aria-hidden="true">→</span> Human approval</p>
      </div>
    </details>
  )
}
