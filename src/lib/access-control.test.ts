import assert from "node:assert/strict";
import test from "node:test";
import { isAdminEmail } from "./access-control";

test("admin email matching is case-insensitive and trims whitespace", () => {
  assert.equal(isAdminEmail(" Owner@Example.com ", "owner@example.com"), true);
});

test("admin email matching does not grant access to other users", () => {
  assert.equal(isAdminEmail("other@example.com", "owner@example.com"), false);
  assert.equal(isAdminEmail("owner@example.com.attacker.test", "owner@example.com"), false);
});

test("admin email matching fails closed when no admin email is configured", () => {
  assert.equal(isAdminEmail("owner@example.com"), false);
});
