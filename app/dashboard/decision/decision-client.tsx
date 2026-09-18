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
import { UploadCsvDialog } from "@/components/procurement/upload-csv-dialog"
import type { DecisionView } from "@/lib/procurement/get-decision-view"

const SUPPLIER_ID = "supplier-a"

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error ?? "Request failed")
  return data
}

export function DecisionClient({ initial }: { initial: DecisionView }) {
  const [view, setView] = useState(initial)
  const [busy, setBusy] = useState(false)

  async function refresh() {
    const res = await fetch(`/api/decisions/${view.decisionId}`)
    if (res.ok) setView(await res.json())
  }

  async function handleSimulate() {
    setBusy(true)
    try {
      const result = await postJson("/api/events/process", { supplierId: SUPPLIER_ID })
      await refresh()
      if (result.duplicate) {
        toast.info("Event already processed. No changes applied.")
      } else {
        toast.warning("Supplier update detected. 1 decision requires review.")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not simulate update")
    } finally {
      setBusy(false)
    }
  }

  async function handleApprove() {
    setBusy(true)
    try {
      await postJson(`/api/decisions/${view.decisionId}/approve`, {
        approvedBy: "Current buyer",
        expectedVersion: view.currentVersion,
      })
      await refresh()
      toast.success("Decision approved.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Approval failed")
    } finally {
      setBusy(false)
    }
  }

  async function handleReject() {
    setBusy(true)
    try {
      await postJson(`/api/decisions/${view.decisionId}/reject`, { rejectedBy: "Current buyer" })
      await refresh()
      toast.error("Recommendation rejected.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reject")
    } finally {
      setBusy(false)
    }
  }

  function handleCorrectData() {
    toast.info("Correction requested. Sourcing team notified.")
  }

  async function handleReplay(): Promise<string> {
    try {
      const result = await postJson("/api/events/replay")
      toast.info(result.message)
      return result.message
    } catch (error) {
      const message = error instanceof Error ? error.message : "Replay failed"
      toast.error(message)
      return message
    }
  }

  async function handleUploaded(result: { duplicate: boolean; message: string }) {
    await refresh()
    if (result.duplicate) {
      toast.info(result.message)
    } else {
      toast.warning("Supplier update detected. 1 decision requires review.")
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <DecisionHeader
        onSimulate={handleSimulate}
        simulateDisabled={busy || view.status === "stale"}
        actions={<UploadCsvDialog onUploaded={handleUploaded} />}
        metrics={view.metrics}
      />

      <RecommendationCard
        status={view.status}
        product={view.product}
        quantity={view.quantity}
        supplierName={view.supplierName}
        unitPrice={view.unitPrice}
        total={view.total}
        saving={view.saving}
        approvedBy={view.approvedBy ?? undefined}
        approvedAt={view.approvedAt ?? undefined}
        sourceVersion={view.sourceVersion ?? undefined}
      />

      {view.priceChange && <DecisionStatus {...view.priceChange} />}
      {view.changeSummary.length > 0 && <ChangeSummary fields={view.changeSummary} />}
      {view.evidence && (
        <EvidencePanel
          trail={view.evidence.trail}
          source={view.evidence.source}
          version={view.evidence.version}
          row={view.evidence.row}
          imported={view.evidence.imported}
          supplier={view.evidence.supplier}
          explanation={view.evidence.explanation}
          previewColumns={view.evidence.previewColumns}
        />
      )}

      <SupplierComparison suppliers={view.suppliers} />

      <ApprovalPanel
        status={view.status}
        recommendedSupplier={view.supplierName}
        approvedBy={view.approvedBy ?? undefined}
        approvedAt={view.approvedAt ?? undefined}
        onApprove={handleApprove}
        onReject={handleReject}
        onCorrectData={handleCorrectData}
      />

      <EventHistory events={view.history} onReplay={handleReplay} />
    </div>
  )
}
