import type { APIRoute } from "astro";
import { clearAdminSessionCookie, isSameOriginRequest } from "../../../lib/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!isSameOriginRequest(request)) {
    return new Response("Forbidden", { status: 403 });
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: "/login",
      "Set-Cookie": clearAdminSessionCookie(request.url),
    },
  });
};
