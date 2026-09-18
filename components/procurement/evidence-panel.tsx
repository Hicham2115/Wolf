import { Sparkles } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { SourceDialog } from "@/components/procurement/source-dialog"

export function EvidencePanel({
  source,
  version,
  row,
  imported,
  supplier,
  explanation,
  previewColumns,
}: {
  source: string
  version: string
  row: number
  imported: string
  supplier: string
  explanation: string | null
  previewColumns: { label: string; value: string }[]
}) {
  return (
    <Card id="evidence">
      <CardHeader>
        <CardTitle>Evidence</CardTitle>
        <CardDescription>Where this recommendation came from.</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Source</dt>
            <dd className="mt-0.5 text-sm font-medium">{source}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Version</dt>
            <dd className="mt-0.5 text-sm font-medium">{version}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Row</dt>
            <dd className="mt-0.5 text-sm font-medium">{row}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Imported</dt>
            <dd className="mt-0.5 text-sm font-medium">{imported}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Supplier</dt>
            <dd className="mt-0.5 text-sm font-medium">{supplier}</dd>
          </div>
        </dl>

        {explanation && (
          <div className="mt-4 border-t pt-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3" />
              Explanation
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">{explanation}</p>
          </div>
        )}

        <div className="mt-4">
          <SourceDialog file={source} row={row} columns={previewColumns} />
        </div>
      </CardContent>
    </Card>
  )
}
