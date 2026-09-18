const GEMINI_MODEL = "gemini-3.6-flash"

export type ExplanationInput = {
  previousSupplier: string
  previousUnitPrice: number
  previousTotal: number
  /** The previous supplier's own new price — what actually changed at the source. */
  updatedSupplierUnitPrice: number
  updatedSupplierTotal: number
  recommendedSupplier: string
  recommendedUnitPrice: number
  recommendedTotal: number
  currency: string
  /** Saving of the recommendation vs staying with the previous supplier at their new price. */
  saving: number | null
}

function money(value: number, currency: string): string {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(value)
}

/** Compares to the cent, avoiding float noise like 2.30 vs 2.2999999. */
function pricesEqual(a: number, b: number): boolean {
  return Math.round(a * 100) === Math.round(b * 100)
}

/**
 * Deterministic, no-network explanation. Always correct because it only
 * restates numbers that were already computed elsewhere — never used to
 * derive them.
 *
 * There are two distinct reasons a recommendation can change, and the
 * sentence must not conflate them:
 *  - the previously-recommended supplier's own price moved, or
 *  - a different supplier's price/offer simply undercuts it, with the
 *    previous supplier's price unchanged.
 */
export function deterministicExplanation(input: ExplanationInput): string {
  const sameSupplier = input.previousSupplier === input.recommendedSupplier
  const previousSupplierChanged = !pricesEqual(input.previousUnitPrice, input.updatedSupplierUnitPrice)
  const savingLine = input.saving ? ` You save ${money(input.saving, input.currency)}.` : ""

  if (sameSupplier) {
    return `${input.previousSupplier} changed its price from ${money(input.previousUnitPrice, input.currency)} to ${money(input.updatedSupplierUnitPrice, input.currency)} per unit. New total: ${money(input.updatedSupplierTotal, input.currency)}.`
  }

  if (previousSupplierChanged) {
    return `${input.previousSupplier} raised its price to ${money(input.updatedSupplierUnitPrice, input.currency)} per unit. ${input.recommendedSupplier} is now cheaper at ${money(input.recommendedUnitPrice, input.currency)} per unit (${money(input.recommendedTotal, input.currency)} total).${savingLine}`
  }

  // Previous supplier's price is unchanged — a different supplier simply
  // offers a better price for the same quantity.
  return `${input.previousSupplier}'s price hasn't changed. ${input.recommendedSupplier} simply offers a lower price: ${money(input.recommendedUnitPrice, input.currency)} per unit (${money(input.recommendedTotal, input.currency)} total).${savingLine}`
}

/**
 * Asks Gemini to phrase an explanation from already-computed numbers. The
 * model never calculates anything — every figure is handed to it verbatim
 * and it only has to turn them into a sentence. If the call fails or no
 * API key is configured, falls back to a deterministic template so the UI
 * never breaks on an LLM outage.
 */
export async function generateExplanation(input: ExplanationInput): Promise<string> {
  const fallback = deterministicExplanation(input)
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return fallback

  const previousSupplierChanged = !pricesEqual(input.previousUnitPrice, input.updatedSupplierUnitPrice)

  const prompt = `Write 1-2 very short, plain sentences (max 30 words total) explaining a procurement recommendation change to a busy buyer. Plain, simple words — no jargon, no long clauses. Use ONLY the numbers given below verbatim — do not calculate, round, or invent anything. Keep each supplier's own price separate from the other supplier's price. Do not claim a supplier's price changed if it did not.

${input.previousSupplier} previous unit price: ${money(input.previousUnitPrice, input.currency)} (total ${money(input.previousTotal, input.currency)})
${input.previousSupplier} current unit price: ${money(input.updatedSupplierUnitPrice, input.currency)} (total ${money(input.updatedSupplierTotal, input.currency)})
${previousSupplierChanged ? "" : `Note: ${input.previousSupplier}'s price has NOT changed.`}
New recommended supplier: ${input.recommendedSupplier}
${input.recommendedSupplier} unit price: ${money(input.recommendedUnitPrice, input.currency)} (total ${money(input.recommendedTotal, input.currency)})
${input.saving ? `Saving of recommendation vs staying with ${input.previousSupplier}: ${money(input.saving, input.currency)}` : ""}

Return only the sentence, no preamble.`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) return fallback

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    return text || fallback
  } catch (error) {
    console.error("Gemini explanation failed, using deterministic fallback", error)
    return fallback
  }
}
