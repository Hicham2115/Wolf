export type DecisionStatus = "approved" | "stale"

export type SupplierStatus = "Updated" | "Recommended" | "Available" | "Approved"

export type SupplierOffer = {
  id: string
  name: string
  unitPrice: number
  quantity: number
  total: number
  saving: number | null
  status: SupplierStatus
}

export type ChangeField = {
  field: string
  previous: string
  current: string
  changed: boolean
}

export type EvidenceStep = {
  label: string
  detail?: string
}

export type HistoryEvent = {
  id: string
  time: string
  title: string
  detail: string
  status: "Completed" | "Action required"
}

export const decisionId = "DEC-0042"

export const product = {
  name: "Sanding Disc 150mm",
  quantity: 10000,
}

export const metrics = {
  openDecisions: 4,
  awaitingApproval: 2,
  staleDecisions: 1,
  approvedThisMonth: 18,
}

export const initialSuppliers: SupplierOffer[] = [
  {
    id: "supplier-a",
    name: "Supplier A",
    unitPrice: 2.0,
    quantity: 10000,
    total: 20000,
    saving: null,
    status: "Approved",
  },
  {
    id: "supplier-b",
    name: "Supplier B",
    unitPrice: 2.3,
    quantity: 10000,
    total: 23000,
    saving: 2000,
    status: "Available",
  },
  {
    id: "supplier-c",
    name: "Supplier C",
    unitPrice: 2.7,
    quantity: 10000,
    total: 27000,
    saving: null,
    status: "Available",
  },
]

export const updatedSuppliers: SupplierOffer[] = [
  {
    id: "supplier-a",
    name: "Supplier A",
    unitPrice: 2.5,
    quantity: 10000,
    total: 25000,
    saving: null,
    status: "Updated",
  },
  {
    id: "supplier-b",
    name: "Supplier B",
    unitPrice: 2.3,
    quantity: 10000,
    total: 23000,
    saving: 2000,
    status: "Recommended",
  },
  {
    id: "supplier-c",
    name: "Supplier C",
    unitPrice: 2.7,
    quantity: 10000,
    total: 27000,
    saving: null,
    status: "Available",
  },
]

export const priceChange = {
  previousSupplier: "Supplier A",
  currentRecommendation: "Supplier B",
  previousPrice: 2.0,
  currentPrice: 2.5,
  previousTotal: 20000,
  currentTotal: 25000,
}

export const changeSummary: ChangeField[] = [
  { field: "Product", previous: "Sanding Disc 150mm", current: "Sanding Disc 150mm", changed: false },
  { field: "Supplier", previous: "Supplier A", current: "Supplier A", changed: false },
  { field: "Quantity", previous: "10,000", current: "10,000", changed: false },
  { field: "Unit price", previous: "€2.00", current: "€2.50", changed: true },
  { field: "Total", previous: "€20,000", current: "€25,000", changed: true },
  { field: "Source", previous: "supplier_A_v1.csv", current: "supplier_A_v2.csv", changed: true },
]

export const evidenceTrail: EvidenceStep[] = [
  { label: "supplier_A_v2.csv" },
  { label: "Source version v2" },
  { label: "Row 18" },
  { label: "Sanding Disc 150mm" },
  { label: "€2.50" },
  { label: "Recommendation" },
  { label: "Decision" },
]

export const evidenceMeta = {
  source: "supplier_A_v2.csv",
  version: "v2",
  row: 18,
  imported: "18 Sep 2026, 10:42",
  supplier: "Supplier A",
}

export const sourceRowPreview = {
  file: "supplier_A_v2.csv",
  row: 18,
  columns: [
    { key: "sku", label: "SKU", value: "SND-150-A" },
    { key: "product", label: "Product", value: "Sanding Disc 150mm" },
    { key: "supplier", label: "Supplier", value: "Supplier A" },
    { key: "unit_price", label: "Unit price", value: "2.50" },
    { key: "currency", label: "Currency", value: "EUR" },
    { key: "quantity", label: "Quantity", value: "10000" },
  ],
}

export const initialHistory: HistoryEvent[] = [
  {
    id: "evt-1",
    time: "09:12",
    title: "Supplier A — supplier_A_v1.csv imported",
    detail: "Initial baseline offer recorded.",
    status: "Completed",
  },
  {
    id: "evt-2",
    time: "15:42",
    title: `Decision ${decisionId} approved`,
    detail: "Approved by Procurement Manager.",
    status: "Completed",
  },
]

export const updateHistory: HistoryEvent[] = [
  {
    id: "evt-3",
    time: "10:42",
    title: "Supplier A — supplier_A_v2.csv received",
    detail: "New price data ingested from supplier feed.",
    status: "Completed",
  },
  {
    id: "evt-4",
    time: "10:42",
    title: `Decision ${decisionId} recalculated`,
    detail: "Supplier B now offers the lowest total cost.",
    status: "Completed",
  },
  {
    id: "evt-5",
    time: "10:42",
    title: "Previous approval marked stale",
    detail: "Approval based on supplier_A_v1.csv is no longer valid.",
    status: "Action required",
  },
]
