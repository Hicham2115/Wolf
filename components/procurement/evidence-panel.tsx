import { ChevronDown } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { SourceDialog } from "@/components/procurement/source-dialog"

export function EvidencePanel({
  trail,
  source,
  version,
  row,
  imported,
  supplier,
  explanation,
  previewColumns,
}: {
  trail: string[]
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
        <div className="flex flex-col items-start gap-1">
          {trail.map((step, index) => (
            <div key={`${step}-${index}`} className="flex flex-col items-start">
              <span className="rounded-md border bg-muted/50 px-3 py-1.5 text-sm font-medium">
                {step}
              </span>
              {index < trail.length - 1 && (
                <ChevronDown className="my-0.5 ml-3 size-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t pt-4 sm:grid-cols-3">
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
          <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">{explanation}</p>
        )}

        <div className="mt-4">
          <SourceDialog file={source} row={row} columns={previewColumns} />
        </div>
      </CardContent>
    </Card>
  )
}
