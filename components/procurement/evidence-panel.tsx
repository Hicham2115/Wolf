import { ChevronDown } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { SourceDialog } from "@/components/procurement/source-dialog"
import { evidenceTrail, evidenceMeta } from "@/lib/mock-data"

export function EvidencePanel() {
  return (
    <Card id="evidence">
      <CardHeader>
        <CardTitle>Evidence</CardTitle>
        <CardDescription>Where this recommendation came from.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-start gap-1">
          {evidenceTrail.map((step, index) => (
            <div key={step.label} className="flex flex-col items-start">
              <span className="rounded-md border bg-muted/50 px-3 py-1.5 text-sm font-medium">
                {step.label}
              </span>
              {index < evidenceTrail.length - 1 && (
                <ChevronDown className="my-0.5 ml-3 size-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t pt-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Source</dt>
            <dd className="mt-0.5 text-sm font-medium">{evidenceMeta.source}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Version</dt>
            <dd className="mt-0.5 text-sm font-medium">{evidenceMeta.version}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Row</dt>
            <dd className="mt-0.5 text-sm font-medium">{evidenceMeta.row}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Imported</dt>
            <dd className="mt-0.5 text-sm font-medium">{evidenceMeta.imported}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Supplier</dt>
            <dd className="mt-0.5 text-sm font-medium">{evidenceMeta.supplier}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <SourceDialog />
        </div>
      </CardContent>
    </Card>
  )
}
