import { test } from "node:test"
import assert from "node:assert/strict"
import { canApprove } from "./approval-guard.ts"

test("canApprove allows approving the current version", () => {
  const result = canApprove({ current_version: 2 }, 2)
  assert.equal(result.ok, true)
})

test("canApprove rejects an outdated version (stale approval protection)", () => {
  const result = canApprove({ current_version: 3 }, 2)
  assert.equal(result.ok, false)
  if (!result.ok) assert.match(result.reason, /no longer current/)
})

test("canApprove allows switching supplier on an already-approved decision", () => {
  const result = canApprove({ current_version: 1 }, 1)
  assert.equal(result.ok, true)
})

test("canApprove allows approval without an expected version check when none is given", () => {
  const result = canApprove({ current_version: 5 }, undefined)
  assert.equal(result.ok, true)
})
