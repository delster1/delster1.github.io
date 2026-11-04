import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { isAdminRequest } from "./lib/admin-auth";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.isAdmin = await isAdminRequest(context.request, env.AUTH_SECRET);

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set(
    "Content-Security-Policy",
    "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'"
  );
  const pathname = new URL(context.request.url).pathname;
  if (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/api/admin/") ||
    pathname.startsWith("/api/auth/")
  ) {
    headers.set("Cache-Control", "private, no-store");
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  if (new URL(context.request.url).protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
