import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { getDashboardMetrics } from "@/lib/procurement/get-metrics"

export const dynamic = "force-dynamic"

export default async function Page() {
  const metrics = await getDashboardMetrics()

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Overview
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Procurement activity across demand, sourcing and decisions.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Open decisions</CardDescription>
            <CardTitle className="text-2xl">{metrics.openDecisions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Awaiting approval</CardDescription>
            <CardTitle className="text-2xl">{metrics.awaitingApproval}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Stale decisions</CardDescription>
            <CardTitle className="text-2xl text-amber-400">{metrics.staleDecisions}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Approved this month</CardDescription>
            <CardTitle className="text-2xl">{metrics.approvedThisMonth}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Decision workflow</CardTitle>
          <CardDescription>
            The MVP feature for this build: review supplier recommendations,
            evidence and approvals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/decision" className={buttonVariants()}>
            Go to Decision
            <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
