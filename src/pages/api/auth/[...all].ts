import type { APIRoute } from "astro";
import { createAuth } from "../../../auth";

export const ALL: APIRoute = async (ctx) => {
  const auth = createAuth(ctx.locals.runtime.env);
  return auth.handler(ctx.request);
};

export const prerender = false;
