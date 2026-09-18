import { NextResponse } from "next/server"
import { parseSupplierCsv } from "@/lib/csv/parse-supplier-csv"
import { processSupplierSource } from "@/lib/procurement/process-source"
import { slugify } from "@/lib/format"

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get("file")
    const supplierName = form.get("supplierName")

    if (!(file instanceof File) || typeof supplierName !== "string" || !supplierName.trim()) {
      return NextResponse.json(
        { error: "Expected multipart form data with 'file' and 'supplierName'" },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    const { rows, errors } = parseSupplierCsv(csvText)

    if (errors.length > 0) {
      return NextResponse.json({ error: "CSV validation failed", details: errors }, { status: 400 })
    }

    const supplierId = slugify(supplierName)
    if (!supplierId) {
      return NextResponse.json({ error: "Supplier name must contain letters or numbers" }, { status: 400 })
    }

    const result = await processSupplierSource({
      supplierId,
      supplierName: supplierName.trim(),
      filename: file.name,
      rows,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 }
    )
  }
}
