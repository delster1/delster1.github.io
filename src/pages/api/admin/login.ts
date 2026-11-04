import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
  createAdminSessionCookie,
  isAdminLoginConfigured,
  isSameOriginRequest,
  verifyAdminCredentials,
} from "../../../lib/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!isSameOriginRequest(request)) {
    return new Response("Forbidden", { status: 403 });
  }

  const limiter = env.ADMIN_LOGIN_LIMITER;
  if (!limiter) {
    console.error("Admin login rate-limit binding is not configured.");
    return new Response("Login temporarily unavailable.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const clientIp = request.headers.get("cf-connecting-ip") ?? "unknown";
  const keyBytes = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(clientIp))
  );
  const rateLimitKey = Array.from(keyBytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const rateLimit = await limiter.limit({ key: rateLimitKey });
  if (!rateLimit.success) {
    return new Response("Too many login attempts. Please wait before trying again.", {
      status: 429,
      headers: { "Cache-Control": "no-store", "Retry-After": "60" },
    });
  }

  const environment = env;
  if (!isAdminLoginConfigured(environment)) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/login?error=unavailable" },
    });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return new Response("Invalid form submission.", { status: 400 });
  }

  const username = formData.get("username");
  const password = formData.get("password");
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.length > 64 ||
    password.length > 1024
  ) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/login?error=invalid" },
    });
  }

  const configuredPassword = environment.ADMIN_PASSWORD;
  const secret = environment.AUTH_SECRET;
  if (!configuredPassword || !secret) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/login?error=unavailable" },
    });
  }

  if (!(await verifyAdminCredentials(username, password, configuredPassword))) {
    return new Response(null, {
      status: 303,
      headers: { Location: "/login?error=invalid" },
    });
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/dashboard",
      "Set-Cookie": await createAdminSessionCookie(secret, request.url),
    },
  });
};
