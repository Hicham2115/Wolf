import { createServiceClient } from "@/lib/supabase/server"
import { compareOffers, savingVsPrevious } from "@/lib/procurement/calculations"
import { getDashboardMetrics } from "@/lib/procurement/get-metrics"
import type { SupplierOfferRow, DashboardMetrics } from "@/lib/procurement/types"

/**
 * This MVP tracks a single procurement decision at a time. Rather than
 * hardcoding its id, we look up whatever decision currently exists so the
 * app works from a freshly wiped database too.
 */
export async function getPrimaryDecisionId(): Promise<string | null> {
  const db = createServiceClient()
  const { data } = await db
    .from("decisions")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()
  return data?.id ?? null
}

export type DecisionView = {
  decisionId: string
  currentVersion: number
  metrics: DashboardMetrics
  status: "approved" | "stale"
  product: string
  quantity: number
  supplierName: string
  unitPrice: number
  total: number
  saving: number | null
  approvedBy: string | null
  approvedAt: string | null
  sourceVersion: string | null
  priceChange: {
    previousSupplier: string
    currentRecommendation: string
    previousPrice: number
    currentPrice: number
    previousTotal: number
    currentTotal: number
  } | null
  changeSummary: { field: string; previous: string; current: string; changed: boolean }[]
  evidence: {
    trail: string[]
    source: string
    version: string
    row: number
    imported: string
    supplier: string
    explanation: string | null
    previewColumns: { label: string; value: string }[]
  } | null
  suppliers: {
    id: string
    name: string
    unitPrice: number
    quantity: number
    total: number
    saving: number | null
    status: "Approved" | "Recommended" | "Updated" | "Available"
  }[]
  history: { id: string; time: string; title: string; detail: string; status: "Completed" | "Action required" }[]
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export async function getDecisionView(decisionId: string): Promise<DecisionView | null> {
  const db = createServiceClient()

  const { data: decision } = await db
    .from("decisions")
    .select("*, products(name)")
    .eq("id", decisionId)
    .maybeSingle()
  if (!decision) return null

  const productName = (decision.products as unknown as { name: string } | null)?.name ?? decision.product_id

  const { data: offerRows } = await db
    .from("supplier_offers")
    .select("supplier_id, product_id, source_id, source_row, quantity, unit_price, currency, created_at, suppliers(name)")
    .eq("product_id", decision.product_id)
    .order("created_at", { ascending: false })

  const latestPerSupplier = new Map<string, NonNullable<typeof offerRows>[number]>()
  for (const row of offerRows ?? []) {
    if (!latestPerSupplier.has(row.supplier_id)) latestPerSupplier.set(row.supplier_id, row)
  }

  const offers: SupplierOfferRow[] = [...latestPerSupplier.values()].map((row) => ({
    supplierId: row.supplier_id,
    supplierName: (row.suppliers as unknown as { name: string } | null)?.name ?? row.supplier_id,
    productId: row.product_id,
    sourceId: row.source_id,
    sourceRow: row.source_row,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    currency: row.currency,
  }))
  const compared = compareOffers(offers)

  const isStale = decision.status === "STALE" || decision.status === "REVIEW_REQUIRED"

  let priceChange: DecisionView["priceChange"] = null
  let changeSummary: DecisionView["changeSummary"] = []
  let previousVersion: { supplier_id: string; unit_price: number; total_price: number; source_id: string } | null = null

  if (isStale && decision.current_version > 1) {
    const { data: prev } = await db
      .from("decision_versions")
      .select("supplier_id, unit_price, total_price, source_id, suppliers(name)")
      .eq("decision_id", decisionId)
      .eq("version", decision.current_version - 1)
      .maybeSingle()
    if (prev) {
      previousVersion = prev
      const prevSupplierName = (prev.suppliers as unknown as { name: string } | null)?.name ?? prev.supplier_id
      const staleOffer = offers.find((o) => o.supplierId === prev.supplier_id)
      if (staleOffer) {
        priceChange = {
          previousSupplier: prevSupplierName,
          currentRecommendation: "",
          previousPrice: Number(prev.unit_price),
          currentPrice: staleOffer.unitPrice,
          previousTotal: Number(prev.total_price),
          currentTotal: staleOffer.quantity * staleOffer.unitPrice,
        }
      }
    }
  }

  const recommended = compared.find((o) => o.isRecommended)
  if (priceChange && recommended) {
    priceChange.currentRecommendation = recommended.supplierName
  }

  if (priceChange) {
    changeSummary = [
      { field: "Product", previous: productName, current: productName, changed: false },
      { field: "Supplier", previous: priceChange.previousSupplier, current: priceChange.previousSupplier, changed: false },
      { field: "Quantity", previous: String(decision.quantity), current: String(decision.quantity), changed: false },
      {
        field: "Unit price",
        previous: priceChange.previousPrice.toFixed(2),
        current: priceChange.currentPrice.toFixed(2),
        changed: priceChange.previousPrice !== priceChange.currentPrice,
      },
      {
        field: "Total",
        previous: priceChange.previousTotal.toFixed(2),
        current: priceChange.currentTotal.toFixed(2),
        changed: priceChange.previousTotal !== priceChange.currentTotal,
      },
    ]
  }

  const { data: evidenceRows } = await db
    .from("evidence")
    .select("source_row, field_name, field_value, source_id, supplier_sources(filename, version, created_at, supplier_id, suppliers(name))")
    .eq("decision_id", decisionId)
    .eq("decision_version", decision.current_version)
    .order("created_at", { ascending: false })

  const { data: currentVersionRow } = await db
    .from("decision_versions")
    .select("explanation")
    .eq("decision_id", decisionId)
    .eq("version", decision.current_version)
    .maybeSingle()

  let evidence: DecisionView["evidence"] = null
  if (evidenceRows && evidenceRows.length > 0) {
    const first = evidenceRows[0]
    const source = first.supplier_sources as unknown as {
      filename: string
      version: number
      created_at: string
      supplier_id: string
      suppliers: { name: string } | null
    } | null
    if (source) {
      evidence = {
        trail: [
          source.filename,
          `Source version v${source.version}`,
          `Row ${first.source_row}`,
          productName,
          ...evidenceRows
            .filter((e) => e.field_name === "unit_price")
            .map((e) => `€${Number(e.field_value).toFixed(2)}`),
          "Recommendation",
          "Decision",
        ],
        source: source.filename,
        version: `v${source.version}`,
        row: first.source_row,
        imported: formatTime(source.created_at),
        supplier: source.suppliers?.name ?? source.supplier_id,
        explanation: currentVersionRow?.explanation ?? null,
        previewColumns: [
          { label: "Product", value: productName },
          { label: "Supplier", value: source.suppliers?.name ?? source.supplier_id },
          ...evidenceRows.map((e) => ({
            label: e.field_name === "unit_price" ? "Unit price" : "Quantity",
            value: e.field_value,
          })),
          { label: "Currency", value: decision.currency ?? "EUR" },
        ],
      }
    }
  }

  const winner = compared.find((o) => o.isRecommended)
  const savingForWinner = savingVsPrevious(
    { supplierId: winner?.supplierId ?? "", supplierName: "", quantity: 0, unitPrice: 0, totalPrice: winner?.totalPrice ?? 0, currency: "EUR", reason: "" },
    priceChange ? priceChange.currentTotal : undefined
  )

  const suppliers: DecisionView["suppliers"] = compared.map((offer) => {
    let status: DecisionView["suppliers"][number]["status"] = "Available"
    if (offer.supplierId === decision.recommended_supplier_id) {
      status = isStale ? "Recommended" : "Approved"
    } else if (previousVersion && offer.supplierId === previousVersion.supplier_id) {
      status = "Updated"
    }
    return {
      id: offer.supplierId,
      name: offer.supplierName,
      unitPrice: offer.unitPrice,
      quantity: offer.quantity,
      total: offer.totalPrice,
      saving: offer.supplierId === winner?.supplierId ? savingForWinner : null,
      status,
    }
  })

  const [{ data: events }, { data: approvals }, { data: versions }] = await Promise.all([
    db.from("events").select("id, event_type, payload, status, created_at, processed_at").eq("decision_id", decisionId).order("created_at", { ascending: true }),
    db.from("approvals").select("id, decision_version, approved_by, approved_at, status").eq("decision_id", decisionId).order("approved_at", { ascending: true }),
    db.from("decision_versions").select("id, version, status, created_at, suppliers(name)").eq("decision_id", decisionId).order("created_at", { ascending: true }),
  ])

  const history: DecisionView["history"] = []
  for (const e of events ?? []) {
    history.push({
      id: `event-${e.id}`,
      time: formatTime(e.processed_at ?? e.created_at),
      title: e.event_type.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c: string) => c.toUpperCase()),
      detail: `Status: ${e.status}`,
      status: e.status === "COMPLETED" ? "Completed" : "Action required",
    })
  }
  for (const v of versions ?? []) {
    const supplierName = (v.suppliers as unknown as { name: string } | null)?.name ?? ""
    history.push({
      id: `version-${v.id}`,
      time: formatTime(v.created_at),
      title: `Decision ${decisionId} recalculated (v${v.version})`,
      detail: `New recommendation: ${supplierName}`,
      status: v.status === "APPROVED" ? "Completed" : "Action required",
    })
  }
  for (const a of approvals ?? []) {
    history.push({
      id: `approval-${a.id}`,
      time: formatTime(a.approved_at),
      title: a.status === "APPROVED" ? `Decision ${decisionId} approved` : `Decision ${decisionId} rejected`,
      detail: `${a.status === "APPROVED" ? "Approved" : "Rejected"} by ${a.approved_by} (v${a.decision_version}).`,
      status: "Completed",
    })
  }
  history.sort((a, b) => a.time.localeCompare(b.time))

  return {
    decisionId,
    currentVersion: decision.current_version,
    metrics: await getDashboardMetrics(),
    status: isStale ? "stale" : "approved",
    product: productName,
    quantity: Number(decision.quantity),
    supplierName: winner?.supplierName ?? "",
    unitPrice: Number(decision.unit_price),
    total: Number(decision.total_price),
    saving: isStale ? savingForWinner : null,
    approvedBy: decision.approved_by,
    approvedAt: decision.approved_at ? formatTime(decision.approved_at) : null,
    sourceVersion: evidence ? evidence.version : null,
    priceChange,
    changeSummary,
    evidence,
    suppliers,
    history,
  }
}
