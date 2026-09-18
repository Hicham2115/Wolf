import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { DecisionStatusValue as DecisionStatus } from "@/lib/procurement/types"

export function ApprovalPanel({
  status,
  recommendedSupplier,
  approvedBy,
  approvedAt,
  onApprove,
  onReject,
}: {
  status: DecisionStatus
  recommendedSupplier: string
  approvedBy?: string
  approvedAt?: string
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <Card id="approval">
      <CardHeader>
        <CardTitle>Buyer decision</CardTitle>
        <CardDescription>
          {status === "stale" &&
            "The previous approval is no longer valid because the underlying supplier evidence changed."}
          {status === "approved" && "This decision is approved and reflects the current supplier data."}
          {status === "rejected" && "This recommendation was rejected and is no longer active."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "stale" && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={onApprove}>Approve {recommendedSupplier}</Button>
            <Button variant="outline" onClick={onReject}>
              Reject
            </Button>
          </div>
        )}
        {status === "approved" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-400" />
            Approved by <span className="font-medium text-foreground">{approvedBy}</span>
            {" · "}
            {approvedAt}
          </div>
        )}
        {status === "rejected" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <XCircle className="size-4" />
            Waiting on new supplier data before this can be reconsidered.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
