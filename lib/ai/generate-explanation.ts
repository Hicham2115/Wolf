const GEMINI_MODEL = "gemini-3.6-flash"

export type ExplanationInput = {
  previousSupplier: string
  previousUnitPrice: number
  previousTotal: number
  recommendedSupplier: string
  recommendedUnitPrice: number
  recommendedTotal: number
  currency: string
  saving: number | null
}

function money(value: number, currency: string): string {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(value)
}

/**
 * Deterministic, no-network explanation. Always correct because it only
 * restates numbers that were already computed elsewhere — never used to
 * derive them.
 */
function deterministicExplanation(input: ExplanationInput): string {
  const priceLine = `${input.previousSupplier} updated the unit price from ${money(input.previousUnitPrice, input.currency)} to ${money(input.recommendedUnitPrice, input.currency)}`
  const sameSupplier = input.previousSupplier === input.recommendedSupplier
  if (sameSupplier) {
    return `${priceLine}, changing the total cost from ${money(input.previousTotal, input.currency)} to ${money(input.recommendedTotal, input.currency)}.`
  }
  const savingLine = input.saving
    ? ` This is ${money(input.saving, input.currency)} lower than continuing with ${input.previousSupplier}.`
    : ""
  return `${priceLine}, increasing the total cost from ${money(input.previousTotal, input.currency)} to ${money(input.recommendedTotal, input.currency)}. ${input.recommendedSupplier} now offers the same quantity at ${money(input.recommendedUnitPrice, input.currency)} per unit.${savingLine}`
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

  const prompt = `Write one short, plain sentence (max 40 words) explaining a procurement recommendation change to a buyer. Use ONLY the numbers given below verbatim — do not calculate, round, or invent anything.

Previous supplier: ${input.previousSupplier}
Previous unit price: ${money(input.previousUnitPrice, input.currency)}
Previous total: ${money(input.previousTotal, input.currency)}
New recommended supplier: ${input.recommendedSupplier}
New unit price: ${money(input.recommendedUnitPrice, input.currency)}
New total: ${money(input.recommendedTotal, input.currency)}
${input.saving ? `Saving vs previous: ${money(input.saving, input.currency)}` : ""}

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
