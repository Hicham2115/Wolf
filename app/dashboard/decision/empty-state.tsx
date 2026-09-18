"use client"

import { useRouter } from "next/navigation"
import { Inbox } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCsvDialog } from "@/components/procurement/upload-csv-dialog"

export function DecisionEmptyState() {
  const router = useRouter()

  function handleUploaded(result: { duplicate: boolean; message: string }) {
    toast.success(result.message)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader className="items-center text-center">
          <Inbox className="mx-auto size-8 text-muted-foreground" />
          <CardTitle className="mt-2">No data yet</CardTitle>
          <CardDescription>
            There is no procurement decision in the database. Upload a
            supplier CSV to create the first one.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <UploadCsvDialog
            onUploaded={handleUploaded}
            trigger={<Button>Upload CSV</Button>}
          />
        </CardContent>
      </Card>
    </div>
  )
}
