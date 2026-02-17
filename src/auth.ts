import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./db/schema";

import {
  ALLOWED_EMAILS,
  AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET,
  AUTH_SECRET,
  BETTER_AUTH_URL,
  D3_EMAIL,
} from "astro:env/server";

const adminEmail = D3_EMAIL;
let adminUser = false;

const allowedEmails = new Set(
  (ALLOWED_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
);
console.log(allowedEmails)

const isEmailAllowed = (email: string) => allowedEmails.has(email.toLowerCase() || isEmailAdmin(email));

export function isEmailAdmin(email: string) {
  if (adminUser) return true;
  if (email === adminEmail) {
    adminUser = true;
    return true;
  }
  return false;
}

export function createAuth(env: any) {
  // Hyperdrive binding name from wrangler.jsonc is "HYPERDRIVE"
  // Most commonly this is available as env.HYPERDRIVE.connectionString (or similar).
  // We'll support both string and object forms defensively.

  const hyper = env.HYPERDRIVE;

  const connectionString =
    (typeof hyper === "string"
      ? hyper
      : hyper?.connectionString ?? hyper?.url ?? hyper?.connection_string) ||
    env.DATABASE_URL ||
    env.BETTER_AUTH_DATABASE_URL ||
    env.AUTH_DB;

  if (!connectionString) {
    throw new Error(
      "Database connection string missing. Expected env.HYPERDRIVE or env.DATABASE_URL."
    );
  }

  const pool = new Pool({
    connectionString,
    // Hyperdrive-managed TLS often works without forcing ssl,
    // but if you hit TLS errors, uncomment:
    // ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(pool);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verificationTokens,
      },
    }),
    emailAndPassword: { enabled: true },
    baseURL: env?.BETTER_AUTH_URL || BETTER_AUTH_URL || "http://localhost:4321",
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

