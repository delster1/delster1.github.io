import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { createAuth } from "../../../auth";

export const ALL: APIRoute = async (ctx) => {
  if (env.ENABLE_LEGACY_AUTH !== "true") {
    return new Response("Legacy authentication is disabled.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
  const auth = createAuth(env);
  return auth.handler(ctx.request);
};

export const prerender = false;
