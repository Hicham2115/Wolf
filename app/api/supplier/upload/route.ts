import { NextResponse } from "next/server"
import { parseSupplierCsv } from "@/lib/csv/parse-supplier-csv"
import { processSupplierSource } from "@/lib/procurement/process-source"

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get("file")
    const supplierId = form.get("supplierId")

    if (!(file instanceof File) || typeof supplierId !== "string" || !supplierId) {
      return NextResponse.json(
        { error: "Expected multipart form data with 'file' and 'supplierId'" },
        { status: 400 }
      )
    }

    const csvText = await file.text()
    const { rows, errors } = parseSupplierCsv(csvText)

    if (errors.length > 0) {
      return NextResponse.json({ error: "CSV validation failed", details: errors }, { status: 400 })
    }

    const result = await processSupplierSource({
      supplierId,
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
