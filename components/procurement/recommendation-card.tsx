import { CheckCircle2, AlertTriangle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "cn"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { formatEUR, formatNumber } from "@/lib/format"
import type { DecisionStatusValue as DecisionStatus } from "@/lib/procurement/types"

export function RecommendationCard({
  status,
  product,
  quantity,
  supplierName,
  unitPrice,
  total,
  saving,
  approvedBy,
  approvedAt,
  sourceVersion,
}: {
  status: DecisionStatus
  product: string
  quantity: number
  supplierName: string
  unitPrice: number
  total: number
  saving: number | null
  approvedBy?: string
  approvedAt?: string
  sourceVersion?: string
}) {
  const isApproved = status === "approved"

  return (
    <Card>
      <CardHeader>
        <CardDescription>Recommendation</CardDescription>
        <CardTitle className="text-lg">{product}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Recommended supplier</dt>
              <dd className="mt-0.5 text-base font-medium">{supplierName}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Quantity</dt>
              <dd className="mt-0.5 text-base font-medium">
                {formatNumber(quantity)} units
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Unit price</dt>
              <dd className="mt-0.5 text-base font-medium">{formatEUR(unitPrice)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Total</dt>
              <dd className="mt-0.5 text-base font-medium">{formatEUR(total)}</dd>
            </div>
          </dl>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <Badge
              className={
                isApproved
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 text-white"
              }
            >
              {isApproved ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <AlertTriangle className="size-3" />
              )}
              {isApproved ? "APPROVED" : "REVIEW REQUIRED"}
            </Badge>
            {saving !== null && !isApproved && (
              <span className="text-xs text-emerald-400">
                Potential saving {formatEUR(saving)}
              </span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-3 bg-transparent">
        {isApproved ? (
          <div className="text-xs text-muted-foreground">
            Approved by <span className="font-medium text-foreground">{approvedBy}</span>
            {" · "}
            {approvedAt}
            {" · source "}
            <span className="font-mono">{sourceVersion}</span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            The previous approval no longer matches the source data.
          </div>
        )}

        {!isApproved && (
          <div className="flex gap-2">
            <a href="#evidence" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Review decision
            </a>
            <a href="#approval" className={cn(buttonVariants({ size: "sm" }))}>
              Approve
            </a>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
