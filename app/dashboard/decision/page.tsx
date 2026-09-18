"use client"

import { useState } from "react"
import { toast } from "sonner"
import { DecisionHeader } from "@/components/procurement/decision-header"
import { RecommendationCard } from "@/components/procurement/recommendation-card"
import { DecisionStatus } from "@/components/procurement/decision-status"
import { ChangeSummary } from "@/components/procurement/change-summary"
import { EvidencePanel } from "@/components/procurement/evidence-panel"
import { SupplierComparison } from "@/components/procurement/supplier-comparison"
import { ApprovalPanel } from "@/components/procurement/approval-panel"
import { EventHistory } from "@/components/procurement/event-history"
import {
  product,
  initialSuppliers,
  updatedSuppliers,
  changeSummary,
  priceChange,
  initialHistory,
  updateHistory,
  type DecisionStatus as Status,
  type HistoryEvent,
  type SupplierOffer,
} from "@/lib/mock-data"

type Approval = {
  approvedBy: string
  approvedAt: string
  sourceVersion: string
}

const initialApproval: Approval = {
  approvedBy: "Procurement Manager",
  approvedAt: "17 Sep 2026, 15:42",
  sourceVersion: "supplier_A_v1.csv",
}

function withStatus(suppliers: SupplierOffer[], id: string, status: SupplierOffer["status"]) {
  return suppliers.map((supplier) =>
    supplier.id === id ? { ...supplier, status } : supplier
  )
}

export default function DecisionPage() {
  const [status, setStatus] = useState<Status>("approved")
  const [recommendedSupplierId, setRecommendedSupplierId] = useState("supplier-a")
  const [approval, setApproval] = useState<Approval>(initialApproval)
  const [history, setHistory] = useState<HistoryEvent[]>(initialHistory)

  const suppliers =
    status === "stale"
      ? updatedSuppliers
      : recommendedSupplierId === "supplier-b"
        ? withStatus(withStatus(updatedSuppliers, "supplier-a", "Updated"), "supplier-b", "Approved")
        : initialSuppliers

  const recommendedSupplier =
    suppliers.find((supplier) => supplier.id === recommendedSupplierId) ?? suppliers[0]

  function pushEvent(event: Omit<HistoryEvent, "id" | "time">) {
    setHistory((prev) => [
      ...prev,
      { ...event, id: crypto.randomUUID(), time: "Just now" },
    ])
  }

  function handleSimulate() {
    setStatus("stale")
    setRecommendedSupplierId("supplier-b")
    setHistory((prev) => [...prev, ...updateHistory])
    toast.warning("Supplier update detected. 1 decision requires review.")
  }

  function handleApprove() {
    setStatus("approved")
    setApproval({
      approvedBy: "Current buyer",
      approvedAt: "Just now",
      sourceVersion: "v2",
    })
    pushEvent({
      title: "Decision DEC-0042 approved",
      detail: "Approved by current buyer based on supplier_A_v2.csv.",
      status: "Completed",
    })
    toast.success("Decision approved.")
  }

  function handleReject() {
    pushEvent({
      title: "Recommendation for Supplier B rejected",
      detail: "Buyer rejected the updated recommendation.",
      status: "Action required",
    })
    toast.error("Recommendation rejected.")
  }

  function handleCorrectData() {
    pushEvent({
      title: "Data correction requested",
      detail: "Buyer flagged supplier_A_v2.csv row 18 for correction.",
      status: "Action required",
    })
    toast.info("Correction requested. Sourcing team notified.")
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <DecisionHeader onSimulate={handleSimulate} simulateDisabled={status === "stale"} />

      <RecommendationCard
        status={status}
        product={product.name}
        quantity={recommendedSupplier.quantity}
        supplierName={recommendedSupplier.name}
        unitPrice={recommendedSupplier.unitPrice}
        total={recommendedSupplier.total}
        saving={recommendedSupplier.saving}
        approvedBy={approval.approvedBy}
        approvedAt={approval.approvedAt}
        sourceVersion={approval.sourceVersion}
      />

      {status === "stale" && <DecisionStatus {...priceChange} />}
      {status === "stale" && <ChangeSummary fields={changeSummary} />}
      {status === "stale" && <EvidencePanel />}

      <SupplierComparison suppliers={suppliers} />

      <ApprovalPanel
        status={status}
        recommendedSupplier={recommendedSupplier.name}
        approvedBy={approval.approvedBy}
        approvedAt={approval.approvedAt}
        onApprove={handleApprove}
        onReject={handleReject}
        onCorrectData={handleCorrectData}
      />

      <EventHistory events={history} />
    </div>
  )
}
