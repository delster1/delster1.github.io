import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionCookie,
  isAdminLoginConfigured,
  isAdminRequest,
  isSameOriginRequest,
  verifyAdminCredentials,
} from "./admin-auth";

const authSecret = "a-local-test-secret-that-is-long-enough-for-hmac";
const adminPassword = "a-local-test-password-long-enough";

test("admin login requires a strong session secret and password", () => {
  assert.equal(
    isAdminLoginConfigured({ AUTH_SECRET: authSecret, ADMIN_PASSWORD: adminPassword }),
    true
  );
  assert.equal(
    isAdminLoginConfigured({ AUTH_SECRET: "short", ADMIN_PASSWORD: adminPassword }),
    false
  );
  assert.equal(
    isAdminLoginConfigured({ AUTH_SECRET: authSecret, ADMIN_PASSWORD: "short" }),
    false
  );
});

test("only the configured owner credentials authenticate", async () => {
  assert.equal(await verifyAdminCredentials("delster1", adminPassword, adminPassword), true);
  assert.equal(await verifyAdminCredentials("someone-else", adminPassword, adminPassword), false);
  assert.equal(await verifyAdminCredentials("delster1", "incorrect", adminPassword), false);
});

test("admin sessions are signed, scoped, and tamper-resistant", async () => {
  const cookie = await createAdminSessionCookie(authSecret, "https://d3llie.tech/login");
  assert.match(cookie, new RegExp(`^${ADMIN_SESSION_COOKIE}=`));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Secure/);

  const cookiePair = cookie.split(";")[0];
  const request = new Request("https://d3llie.tech/dashboard", {
    headers: { cookie: cookiePair },
  });
  assert.equal(await isAdminRequest(request, authSecret), true);
  assert.equal(await isAdminRequest(request, "a-different-secret-long-enough-to-sign"), false);

  const [name, token] = cookiePair.split("=");
  const tampered = new Request("https://d3llie.tech/dashboard", {
    headers: { cookie: `${name}=${token.slice(0, -1)}x` },
  });
  assert.equal(await isAdminRequest(tampered, authSecret), false);
});

test("admin form requests must come from the same origin", () => {
  assert.equal(
    isSameOriginRequest(
      new Request("https://d3llie.tech/api/admin/login", {
        method: "POST",
        headers: { origin: "https://d3llie.tech" },
      })
    ),
    true
  );
  assert.equal(
    isSameOriginRequest(
      new Request("https://d3llie.tech/api/admin/login", {
        method: "POST",
        headers: { origin: "https://attacker.example" },
      })
    ),
    false
  );
});
