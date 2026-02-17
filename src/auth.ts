import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import {
  ALLOWED_EMAILS,
  AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET,
  AUTH_SECRET,
  BETTER_AUTH_URL,
  D3_EMAIL,
} from "astro:env/server";

// NOTE: no DATABASE_URL import for Workers+Hyperdrive

export function createAuth(env: any) {
  // Hyperdrive binding name from wrangler.jsonc is "HYPERDRIVE"
  // Most commonly this is available as env.HYPERDRIVE.connectionString (or similar).
  // We'll support both string and object forms defensively.

  const hyper = env.HYPERDRIVE;

  const connectionString =
    typeof hyper === "string"
      ? hyper
      : hyper?.connectionString ?? hyper?.url ?? hyper?.connection_string;

  if (!connectionString) {
    throw new Error(
      "Hyperdrive binding missing. Expected env.HYPERDRIVE to provide a connection string."
    );
  }

  const pool = new Pool({
    connectionString,
    // Hyperdrive-managed TLS often works without forcing ssl,
    // but if you hit TLS errors, uncomment:
    // ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(pool);

  const allowedEmails = new Set(
    (ALLOWED_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );

  const adminEmail = D3_EMAIL;
  let adminUser = false;

  const isEmailAllowed = (email: string) => allowedEmails.has(email.toLowerCase());
  const isEmailAdmin = (email: string) => {
    if (adminUser) return true;
    if (email === adminEmail) {
      adminUser = true;
      return true;
    }
    return false;
  };

  return betterAuth({
    database: db,
    emailAndPassword: { enabled: true },
    baseURL: BETTER_AUTH_URL || "http://localhost:4321",
    secret: AUTH_SECRET,
    socialProviders: {
      github: {
        clientId: AUTH_GITHUB_ID,
        clientSecret: AUTH_GITHUB_SECRET,
      },
    },
    emailVerification: { sendOnSignUp: false },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-up/email") return;
        const email = String(ctx.body?.email ?? "");
        if (!email || !isEmailAllowed(email)) {
          throw new APIError("UNPROCESSABLE_ENTITY", {
            message: "This email isn’t on the invite list.",
          });
        }
      }),
    },
  });
}

