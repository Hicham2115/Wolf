import { NextResponse } from "next/server"
import { processSupplierSource } from "@/lib/procurement/process-source"
import type { NormalizedOfferInput } from "@/lib/procurement/types"

// Demo payload used by the "Simulate supplier update" button when no
// explicit rows are supplied: Supplier A raising the sanding disc price.
const DEMO_SOURCES: Record<string, { supplierName: string; filename: string; rows: NormalizedOfferInput[] }> = {
  "supplier-a": {
    supplierName: "Supplier A",
    filename: "supplier_A_v2.csv",
    rows: [
      {
        productCode: "SD-150",
        productName: "Sanding Disc 150mm",
        unit: "unit",
        quantity: 10000,
        unitPrice: 2.5,
        currency: "EUR",
        sourceRow: 1,
      },
    ],
  },
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const supplierId: string | undefined = body.supplierId

    if (!supplierId) {
      return NextResponse.json({ error: "supplierId is required" }, { status: 400 })
    }

    const filename: string | undefined = body.filename
    const rows: NormalizedOfferInput[] | undefined = body.rows
    const supplierName: string | undefined = body.supplierName

    const source = rows
      ? { supplierName: supplierName ?? supplierId, filename: filename ?? `${supplierId}.csv`, rows }
      : DEMO_SOURCES[supplierId]

    if (!source) {
      return NextResponse.json(
        { error: `No demo source configured for supplier "${supplierId}"` },
        { status: 400 }
      )
    }

    const result = await processSupplierSource({
      supplierId,
      supplierName: source.supplierName,
      filename: source.filename,
      rows: source.rows,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Event processing failed" },
      { status: 400 }
    )
  }
}
