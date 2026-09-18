"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { sourceRowPreview } from "@/lib/mock-data"

export function SourceDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <ExternalLink className="size-4" />
        View source
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {sourceRowPreview.file} — row {sourceRowPreview.row}
          </DialogTitle>
          <DialogDescription>
            Raw values as received from the supplier feed.
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border p-4 text-sm">
          {sourceRowPreview.columns.map((column) => (
            <div key={column.key} className="contents">
              <dt className="text-muted-foreground">{column.label}</dt>
              <dd className="font-mono">{column.value}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  )
}
