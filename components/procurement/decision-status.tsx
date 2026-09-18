import { AlertTriangle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatEUR } from "@/lib/format"

export function DecisionStatus({
  previousSupplier,
  currentRecommendation,
  previousPrice,
  currentPrice,
  previousTotal,
  currentTotal,
}: {
  previousSupplier: string
  currentRecommendation: string
  previousPrice: number
  currentPrice: number
  previousTotal: number
  currentTotal: number
}) {
  const difference = currentTotal - previousTotal

  return (
    <Card className="border-l-2 border-l-warning">
      <CardContent className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
        <div className="flex-1">
          <p className="text-xs font-medium tracking-wide text-warning uppercase">
            Decision requires review
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This decision was based on supplier data that has changed.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Previous price</p>
              <p className="mt-0.5 text-sm font-medium">{formatEUR(previousPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current price</p>
              <p className="mt-0.5 text-sm font-medium">{formatEUR(currentPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Previous total</p>
              <p className="mt-0.5 text-sm font-medium">{formatEUR(previousTotal)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current total</p>
              <p className="mt-0.5 text-sm font-medium">
                {formatEUR(currentTotal)}
                <span className="ml-1 text-warning">
                  ({difference >= 0 ? "+" : ""}
                  {formatEUR(difference)})
                </span>
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-foreground">
            Previous supplier <span className="font-medium">{previousSupplier}</span>
            {" → "}
            Current recommendation{" "}
            <span className="font-medium">{currentRecommendation}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
