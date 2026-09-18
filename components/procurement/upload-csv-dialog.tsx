"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  SupplierCsvUploadError,
  useUploadSupplierCsv,
  type UploadSupplierCsvResult,
} from "@/hooks/use-upload-supplier-csv"

export function UploadCsvDialog({
  onUploaded,
  trigger,
}: {
  onUploaded: (result: UploadSupplierCsvResult) => void
  trigger?: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const [supplierName, setSupplierName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const uploadCsv = useUploadSupplierCsv()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !supplierName.trim()) return
    setErrors([])

    uploadCsv.mutate(
      { file, supplierName },
      {
        onSuccess: (data) => {
          onUploaded(data)
          setOpen(false)
          setFile(null)
        },
        onError: (error) => {
          const details =
            error instanceof SupplierCsvUploadError
              ? error.details
              : [error.message]
          setErrors(details)
          toast.error(details[0])
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? <Button variant="outline" />}>
        <Upload className="size-4" />
        Upload CSV
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload supplier data</DialogTitle>
          <DialogDescription>
            Columns: product_code, product_name, quantity, unit, unit_price, currency
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="supplier-name">Supplier name</Label>
            <Input
              id="supplier-name"
              placeholder="e.g. Supplier A"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="csv-file">CSV file</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {errors.length > 0 && (
            <ul className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}

          <Button
            type="submit"
            disabled={!file || !supplierName.trim() || uploadCsv.isPending}
          >
            {uploadCsv.isPending ? "Uploading..." : "Upload and process"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
