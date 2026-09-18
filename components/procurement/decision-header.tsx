import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { DashboardMetrics } from "@/lib/procurement/types"

export function DecisionHeader({
  actions,
  metrics,
}: {
  actions?: React.ReactNode
  metrics: DashboardMetrics
}) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Decision
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review supplier recommendations, evidence and approval status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Open decisions</CardDescription>
            <CardTitle className="text-xl">{metrics.openDecisions}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Awaiting approval</CardDescription>
            <CardTitle className="text-xl">{metrics.awaitingApproval}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Stale decisions</CardDescription>
            <CardTitle className="text-xl text-amber-400">
              {metrics.staleDecisions}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Approved this month</CardDescription>
            <CardTitle className="text-xl">{metrics.approvedThisMonth}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
