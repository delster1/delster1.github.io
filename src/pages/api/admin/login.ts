import type { APIRoute } from "astro";
import {
  createAdminSessionCookie,
  isAdminLoginConfigured,
  isSameOriginRequest,
  verifyAdminCredentials,
} from "../../../lib/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!isSameOriginRequest(request)) {
    return new Response("Forbidden", { status: 403 });
  }

  const environment = locals.runtime.env;
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
