import { test } from "node:test"
import assert from "node:assert/strict"
import {
  calculateTotal,
  calculateSaving,
  hasPriceChanged,
  compareOffers,
  buildRecommendation,
  savingVsPrevious,
} from "./calculations"
import type { SupplierOfferRow } from "./types"

test("calculateTotal multiplies quantity by unit price", () => {
  assert.equal(calculateTotal(10000, 2.5), 25000)
})

test("calculateSaving is the previous minus candidate total", () => {
  assert.equal(calculateSaving(25000, 23000), 2000)
})

test("calculateSaving returns null when there is no saving", () => {
  assert.equal(calculateSaving(20000, 25000), null)
})

test("hasPriceChanged detects a changed unit price", () => {
  assert.equal(hasPriceChanged(2.0, 2.5), true)
  assert.equal(hasPriceChanged(2.0, 2.0), false)
})

const offers: SupplierOfferRow[] = [
  { supplierId: "supplier-a", supplierName: "Supplier A", productId: "p", sourceId: "s-a", sourceRow: 1, quantity: 10000, unitPrice: 2.5, currency: "EUR" },
  { supplierId: "supplier-b", supplierName: "Supplier B", productId: "p", sourceId: "s-b", sourceRow: 1, quantity: 10000, unitPrice: 2.3, currency: "EUR" },
  { supplierId: "supplier-c", supplierName: "Supplier C", productId: "p", sourceId: "s-c", sourceRow: 1, quantity: 10000, unitPrice: 2.7, currency: "EUR" },
]

test("compareOffers recommends the cheapest same-currency offer", () => {
  const compared = compareOffers(offers)
  const recommended = compared.filter((o) => o.isRecommended)
  assert.equal(recommended.length, 1)
  assert.equal(recommended[0].supplierId, "supplier-b")
  assert.equal(recommended[0].totalPrice, 23000)
})

test("buildRecommendation picks Supplier B at 23000", () => {
  const recommendation = buildRecommendation(compareOffers(offers))
  assert.equal(recommendation?.supplierId, "supplier-b")
  assert.equal(recommendation?.totalPrice, 23000)
})

test("savingVsPrevious compares against the previous decision total", () => {
  const recommendation = buildRecommendation(compareOffers(offers))!
  assert.equal(savingVsPrevious(recommendation, 25000), 2000)
})

test("compareOffers does not compare offers across different currencies", () => {
  const mixed: SupplierOfferRow[] = [
    ...offers,
    { supplierId: "supplier-d", supplierName: "Supplier D", productId: "p", sourceId: "s-d", sourceRow: 1, quantity: 10000, unitPrice: 1, currency: "USD" },
  ]
  const compared = compareOffers(mixed)
  assert.ok(compared.every((o) => !o.isRecommended))
})
