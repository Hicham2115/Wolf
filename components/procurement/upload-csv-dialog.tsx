"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
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

export function UploadCsvDialog({
  onUploaded,
  trigger,
}: {
  onUploaded: (result: { duplicate: boolean; message: string }) => void
  trigger?: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const [supplierName, setSupplierName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file || !supplierName.trim()) return
    setBusy(true)
    setErrors([])
    try {
      const form = new FormData()
      form.set("file", file)
      form.set("supplierName", supplierName.trim())

      const res = await fetch("/api/supplier/upload", { method: "POST", body: form })
      const data = await res.json()

      if (!res.ok) {
        const details = Array.isArray(data.details)
          ? data.details.map((d: { row: number; message: string }) => `Row ${d.row}: ${d.message}`)
          : [data.error ?? "Upload failed"]
        setErrors(details)
        return
      }

      onUploaded(data)
      setOpen(false)
      setFile(null)
    } finally {
      setBusy(false)
    }
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

          <Button type="submit" disabled={!file || !supplierName.trim() || busy}>
            {busy ? "Uploading..." : "Upload and process"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
