import type { ComparedOffer, Recommendation, SupplierOfferRow } from "./types"

// All money math lives here as plain deterministic functions.
// The LLM is never allowed to compute these values itself.

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateTotal(quantity: number, unitPrice: number): number {
  return round2(quantity * unitPrice)
}

/** Positive when candidateTotal is cheaper than baselineTotal, otherwise null. */
export function calculateSaving(
  baselineTotal: number,
  candidateTotal: number
): number | null {
  const saving = round2(baselineTotal - candidateTotal)
  return saving > 0 ? saving : null
}

export function hasPriceChanged(previousUnitPrice: number, currentUnitPrice: number): boolean {
  return round2(previousUnitPrice) !== round2(currentUnitPrice)
}

/**
 * Ranks offers by total price. The cheapest same-currency offer is marked
 * recommended. Mixed currencies are never compared against each other.
 *
 * On an exact tie, `preferredSupplierId` (normally the currently
 * recommended supplier) wins rather than whichever offer happens to sort
 * first — otherwise the recommendation could silently flip between tied
 * suppliers depending on fetch order, with no real price difference to
 * justify it.
 */
export function compareOffers(
  offers: SupplierOfferRow[],
  preferredSupplierId?: string
): ComparedOffer[] {
  const withTotals = offers.map((offer) => ({
    ...offer,
    totalPrice: calculateTotal(offer.quantity, offer.unitPrice),
    saving: null as number | null,
  }))

  const comparable = new Set(withTotals.map((o) => o.currency)).size === 1
  let cheapest: (typeof withTotals)[number] | undefined
  if (comparable) {
    const lowestTotal = Math.min(...withTotals.map((o) => o.totalPrice))
    const tied = withTotals.filter((o) => o.totalPrice === lowestTotal)
    cheapest = tied.find((o) => o.supplierId === preferredSupplierId) ?? tied[0]
  }

  return withTotals.map((offer) => ({
    ...offer,
    isRecommended: comparable && offer.supplierId === cheapest?.supplierId,
  }))
}

/**
 * Builds the recommendation from the cheapest offer. When a previous
 * decision total is supplied, the saving is measured against it (how much
 * cheaper this recommendation is than what was previously approved) rather
 * than against the other current offers.
 */
export function buildRecommendation(offers: ComparedOffer[]): Recommendation | null {
  const winner = offers.find((o) => o.isRecommended)
  if (!winner) return null
  return {
    supplierId: winner.supplierId,
    supplierName: winner.supplierName,
    quantity: winner.quantity,
    unitPrice: winner.unitPrice,
    totalPrice: winner.totalPrice,
    currency: winner.currency,
    reason: "Lowest valid total price among available offers",
  }
}

export function savingVsPrevious(
  recommendation: Recommendation,
  previousTotal: number | undefined
): number | null {
  if (previousTotal === undefined) return null
  return calculateSaving(previousTotal, recommendation.totalPrice)
}
  