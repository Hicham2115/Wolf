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
import { DecisionHowItWorks, DecisionWorkflow } from "@/components/procurement/decision-workflow"
import type { DecisionView } from "@/lib/procurement/get-decision-view"

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
  const [approving, setApproving] = useState(false)

  async function refresh() {
    const res = await fetch(`/api/decisions/${view.decisionId}`)
    if (res.ok) setView(await res.json())
  }

  async function handleApprove(supplierId?: string) {
    setApproving(true)
    try {
      await postJson(`/api/decisions/${view.decisionId}/approve`, {
        approvedBy: "Current buyer",
        expectedVersion: view.currentVersion,
        supplierId,
      })
      await refresh()
      toast.success("Decision approved.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Approval failed")
      // The decision likely moved on while this was open (a newer supplier
      // update arrived) — reload so the buyer reviews the current version
      // instead of acting on stale data again.
      await refresh()
    } finally {
      setApproving(false)
    }
  }

  async function handleReject() {
    try {
      await postJson(`/api/decisions/${view.decisionId}/reject`, { rejectedBy: "Current buyer" })
      await refresh()
      toast.error("Recommendation rejected.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not reject")
    }
  }

  async function handleUploaded(result: {
    duplicate: boolean
    message: string
    outcomes: { changed: boolean }[]
  }) {
    await refresh()
    if (result.duplicate) {
      toast.info(result.message)
    } else if (result.outcomes.some((o) => o.changed)) {
      toast.warning("Supplier update detected. 1 decision requires review.")
    } else {
      toast.success("Supplier data updated. No change to the current recommendation.")
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <DecisionHeader
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
        onApprove={() => handleApprove()}
        approvePending={approving}
      />

      <DecisionWorkflow status={view.status} />

      {view.priceChange && <DecisionStatus {...view.priceChange} />}
      {view.changeSummary.length > 0 && <ChangeSummary fields={view.changeSummary} />}
      {view.evidence && (
        <EvidencePanel
          source={view.evidence.source}
          version={view.evidence.version}
          row={view.evidence.row}
          imported={view.evidence.imported}
          supplier={view.evidence.supplier}
          explanation={view.evidence.explanation}
          previewColumns={view.evidence.previewColumns}
        />
      )}

      <SupplierComparison
        suppliers={view.suppliers}
        onApprove={handleApprove}
        approvePending={approving}
      />

      <ApprovalPanel
        status={view.status}
        recommendedSupplier={view.supplierName}
        suppliers={view.suppliers}
        approvedBy={view.approvedBy ?? undefined}
        approvedAt={view.approvedAt ?? undefined}
        onApprove={handleApprove}
        onReject={handleReject}
        approvePending={approving}
      />

      <EventHistory
        decisionId={view.decisionId}
        events={view.history}
        onCleared={refresh}
      />

      <DecisionHowItWorks />
    </div>
  )
}
