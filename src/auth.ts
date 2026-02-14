import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import postgres from "postgres";
import "dotenv/config";

const env =
  process.env.ASTRO_RUNTIME === "true"
    ? await import("astro:env/server")
    : (process.env as any);

const {
  ALLOWED_EMAILS,
  AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET,
  AUTH_SECRET,
  BETTER_AUTH_URL,
  D3_EMAIL,
} = env;

const AUTH_DB = "postgresql://postgres:R0ck3tL3agu369!@127.0.0.1:5432/betterauth_db"

// --- guards so the CLI yells clearly instead of exploding weirdly ---
if (!AUTH_SECRET) throw new Error("Missing AUTH_SECRET");
if (!AUTH_DB) throw new Error("Missing AUTH_DB (set it in .env for CLI/dev)");
if (!AUTH_GITHUB_ID) console.warn("AUTH_GITHUB_ID missing (ok if not using GitHub locally)");
if (!AUTH_GITHUB_SECRET) console.warn("AUTH_GITHUB_SECRET missing (ok if not using GitHub locally)");

const allowedEmails = new Set(
  String(ALLOWED_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);

export const isEmailAllowed = (email: string) => {
  const e = String(email ?? "").trim().toLowerCase();
  return allowedEmails.size === 0 ? true : allowedEmails.has(e);
};

let adminUser = false;
const adminEmail = String(D3_EMAIL ?? "").trim().toLowerCase();

export const isEmailAdmin = (email: string) => {
  const e = String(email ?? "").trim().toLowerCase();
  if (adminUser) return true;
  if (adminEmail && e === adminEmail) {
    adminUser = true;
    return true;
  }
  return false;
};

// Hyperdrive binding provides a connection string at runtime.
// In local CLI/dev, AUTH_DB should be a normal postgres connection string.
const sql = postgres(String(AUTH_DB), {
  ssl: "require",
  prepare: false, // good for Workers
});

export const auth = betterAuth({
  database: {
    type: "postgres",
    connection: sql,
  },
  emailAndPassword: {
    enabled: true,
  },
  baseURL: BETTER_AUTH_URL || "http://localhost:4321",
  secret: AUTH_SECRET,

  // Only enable GitHub provider if creds exist
  ...(AUTH_GITHUB_ID && AUTH_GITHUB_SECRET
    ? {
        socialProviders: {
          github: {
            clientId: AUTH_GITHUB_ID,
            clientSecret: AUTH_GITHUB_SECRET,
          },
        },
      }
    : {}),

  emailVerification: {
    sendOnSignUp: false,
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Only gate email+password signup
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

// Better Auth CLI expects a default export config

