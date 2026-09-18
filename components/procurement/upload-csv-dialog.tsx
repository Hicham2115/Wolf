"use client"

import { useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

const SUPPLIERS = [
  { id: "supplier-a", label: "Supplier A" },
  { id: "supplier-b", label: "Supplier B" },
  { id: "supplier-c", label: "Supplier C" },
]

export function UploadCsvDialog({
  onUploaded,
}: {
  onUploaded: (result: { duplicate: boolean; message: string }) => void
}) {
  const [open, setOpen] = useState(false)
  const [supplierId, setSupplierId] = useState("supplier-a")
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setBusy(true)
    setErrors([])
    try {
      const form = new FormData()
      form.set("file", file)
      form.set("supplierId", supplierId)

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
      <DialogTrigger render={<Button variant="outline" />}>
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
            <Label htmlFor="supplier">Supplier</Label>
            <Select value={supplierId} onValueChange={(v) => setSupplierId(v as string)}>
              <SelectTrigger id="supplier" className="w-full">
                <SelectValue placeholder="Select a supplier" />
              </SelectTrigger>
              <SelectContent>
                {SUPPLIERS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <Button type="submit" disabled={!file || busy}>
            {busy ? "Uploading..." : "Upload and process"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
