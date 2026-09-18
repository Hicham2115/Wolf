import { parse } from "csv-parse/sync"
import type { NormalizedOfferInput } from "@/lib/procurement/types"

const REQUIRED_COLUMNS = [
  "product_code",
  "product_name",
  "quantity",
  "unit",
  "unit_price",
  "currency",
] as const

export type CsvValidationError = {
  row: number
  message: string
}

export type ParsedSupplierCsv = {
  rows: NormalizedOfferInput[]
  errors: CsvValidationError[]
}

function normalizeNumber(raw: string): number | null {
  const cleaned = raw.trim().replace(/,/g, "")
  if (cleaned === "" || Number.isNaN(Number(cleaned))) return null
  return Number(cleaned)
}

/**
 * Parses and normalizes a supplier CSV. Never silently repairs bad values —
 * invalid rows are reported as errors instead of being coerced.
 */
export function parseSupplierCsv(csvText: string): ParsedSupplierCsv {
  let records: Record<string, string>[]
  try {
    records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
  } catch (cause) {
    throw new Error("Could not parse CSV file", { cause })
  }

  if (records.length === 0) {
    throw new Error("CSV file has no data rows")
  }

  const header = Object.keys(records[0])
  const missing = REQUIRED_COLUMNS.filter((column) => !header.includes(column))
  if (missing.length > 0) {
    throw new Error(`CSV is missing required columns: ${missing.join(", ")}`)
  }

  const rows: NormalizedOfferInput[] = []
  const errors: CsvValidationError[] = []

  records.forEach((record, index) => {
    const sourceRow = index + 1
    const quantity = normalizeNumber(record.quantity)
    const unitPrice = normalizeNumber(record.unit_price)
    const productCode = record.product_code?.trim()
    const productName = record.product_name?.trim()
    const unit = record.unit?.trim()
    const currency = record.currency?.trim().toUpperCase()

    if (!productCode || !productName) {
      errors.push({ row: sourceRow, message: "Missing product_code or product_name" })
      return
    }
    if (quantity === null || quantity <= 0) {
      errors.push({ row: sourceRow, message: `Invalid quantity: "${record.quantity}"` })
      return
    }
    if (unitPrice === null || unitPrice <= 0) {
      errors.push({ row: sourceRow, message: `Invalid unit_price: "${record.unit_price}"` })
      return
    }
    if (!currency || currency.length !== 3) {
      errors.push({ row: sourceRow, message: `Invalid currency: "${record.currency}"` })
      return
    }

    rows.push({
      productCode,
      productName,
      unit: unit || "unit",
      quantity,
      unitPrice,
      currency,
      sourceRow,
    })
  })

  return { rows, errors }
}
