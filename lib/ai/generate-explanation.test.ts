import { test } from "node:test"
import assert from "node:assert/strict"
import { deterministicExplanation } from "./generate-explanation.ts"

test("deterministicExplanation describes a real price change for the previous supplier", () => {
  const text = deterministicExplanation({
    previousSupplier: "Supplier A",
    previousUnitPrice: 2.0,
    previousTotal: 20000,
    updatedSupplierUnitPrice: 2.5,
    updatedSupplierTotal: 25000,
    recommendedSupplier: "Supplier B",
    recommendedUnitPrice: 2.3,
    recommendedTotal: 23000,
    currency: "EUR",
    saving: 2000,
  })
  assert.match(text, /Supplier A updated the unit price from €2\.00 to €2\.50/)
  assert.match(text, /Supplier B/)
})

test("deterministicExplanation never claims a price changed when it didn't", () => {
  const text = deterministicExplanation({
    previousSupplier: "sub b",
    previousUnitPrice: 2.3,
    previousTotal: 23000,
    updatedSupplierUnitPrice: 2.3,
    updatedSupplierTotal: 23000,
    recommendedSupplier: "supA",
    recommendedUnitPrice: 2.1,
    recommendedTotal: 21000,
    currency: "EUR",
    saving: 2000,
  })
  assert.doesNotMatch(text, /updated the unit price/)
  assert.match(text, /has not changed/)
  assert.match(text, /supA/)
})
