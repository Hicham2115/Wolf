export type SupplierOfferRow = {
  supplierId: string
  supplierName: string
  productId: string
  sourceId: string
  sourceRow: number
  quantity: number
  unitPrice: number
  currency: string
}

export type ComparedOffer = SupplierOfferRow & {
  totalPrice: number
  saving: number | null
  isRecommended: boolean
}

export type Recommendation = {
  supplierId: string
  supplierName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  currency: string
  reason: string
}

export type CsvRow = {
  product_code: string
  product_name: string
  quantity: string
  unit: string
  unit_price: string
  currency: string
}

export type NormalizedOfferInput = {
  productCode: string
  productName: string
  unit: string
  quantity: number
  unitPrice: number
  currency: string
  sourceRow: number
}

export type DecisionStatusValue = "approved" | "stale" | "rejected"

export type ChangeField = {
  field: string
  previous: string
  current: string
  changed: boolean
}

export type SupplierComparisonRow = {
  id: string
  name: string
  unitPrice: number
  quantity: number
  total: number
  saving: number | null
  status: "Approved" | "Recommended" | "Updated" | "Available" | "Rejected"
}

export type DashboardMetrics = {
  openDecisions: number
  awaitingApproval: number
  staleDecisions: number
  approvedThisMonth: number
}
