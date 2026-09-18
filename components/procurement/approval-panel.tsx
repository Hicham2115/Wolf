"use client"

import { useState } from "react"
import { CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatEUR } from "@/lib/format"
import type { DecisionStatusValue as DecisionStatus, SupplierComparisonRow } from "@/lib/procurement/types"

export function ApprovalPanel({
  status,
  recommendedSupplier,
  suppliers,
  approvedBy,
  approvedAt,
  onApprove,
  onReject,
  approvePending,
}: {
  status: DecisionStatus
  recommendedSupplier: string
  suppliers: SupplierComparisonRow[]
  approvedBy?: string
  approvedAt?: string
  onApprove: (supplierId: string) => void
  onReject: () => void
  approvePending?: boolean
}) {
  const recommendedId =
    suppliers.find((s) => s.status === "Recommended" || s.status === "Approved")?.id ??
    suppliers[0]?.id ??
    ""
  const [selectedId, setSelectedId] = useState(recommendedId)
  const selected = suppliers.find((s) => s.id === selectedId)
  const isOverride = selected && selected.name !== recommendedSupplier

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
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedId} onValueChange={(v) => setSelectedId(v as string)}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Choose a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {formatEUR(s.unitPrice)}/unit ({formatEUR(s.total)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">
                System recommends {recommendedSupplier}. You can approve a
                different supplier if you have reason to.
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onApprove(selectedId)}
                disabled={approvePending || !selectedId}
              >
                {approvePending
                  ? "Approving..."
                  : `Approve ${selected?.name ?? recommendedSupplier}${isOverride ? " (override)" : ""}`}
              </Button>
              <Button variant="outline" onClick={onReject} disabled={approvePending}>
                Reject
              </Button>
            </div>
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
