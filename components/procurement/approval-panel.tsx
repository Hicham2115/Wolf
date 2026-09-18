import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { DecisionStatus } from "@/lib/mock-data"

export function ApprovalPanel({
  status,
  recommendedSupplier,
  approvedBy,
  approvedAt,
  onApprove,
  onReject,
  onCorrectData,
}: {
  status: DecisionStatus
  recommendedSupplier: string
  approvedBy?: string
  approvedAt?: string
  onApprove: () => void
  onReject: () => void
  onCorrectData: () => void
}) {
  return (
    <Card id="approval">
      <CardHeader>
        <CardTitle>Buyer decision</CardTitle>
        <CardDescription>
          {status === "stale"
            ? "The previous approval is no longer valid because the underlying supplier evidence changed."
            : "This decision is approved and reflects the current supplier data."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "stale" ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={onApprove}>Approve {recommendedSupplier}</Button>
            <Button variant="outline" onClick={onReject}>
              Reject
            </Button>
            <Button variant="ghost" onClick={onCorrectData}>
              Correct data
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-400" />
            Approved by <span className="font-medium text-foreground">{approvedBy}</span>
            {" · "}
            {approvedAt}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
