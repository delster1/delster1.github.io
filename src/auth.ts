import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "./db/schema";
import { isAdminEmail } from "./lib/access-control";

import {
  AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET,
  AUTH_SECRET,
  BETTER_AUTH_URL,
  D3_EMAIL,
} from "astro:env/server";

export function createAuth(env: App.Environment) {
  const connectionString =
    env.HYPERDRIVE?.connectionString ||
    env.DATABASE_URL ||
    env.BETTER_AUTH_DATABASE_URL ||
    env.AUTH_DB;

  if (!connectionString) {
    throw new Error(
      "Database connection string missing. Expected env.HYPERDRIVE or env.DATABASE_URL."
    );
  }

  const pool = new Pool({ connectionString });

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
    emailAndPassword: { enabled: false },
    baseURL: env?.BETTER_AUTH_URL || BETTER_AUTH_URL || "http://localhost:4321",
    secret: AUTH_SECRET,
    socialProviders: {
      github: {
        clientId: AUTH_GITHUB_ID,
        clientSecret: AUTH_GITHUB_SECRET,
      },
    },
    emailVerification: { sendOnSignUp: false },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!user.emailVerified || !isAdminEmail(user.email, D3_EMAIL)) {
              throw new APIError("FORBIDDEN", {
                message: "Only the site owner can create an account.",
              });
            }
            return { data: user };
          },
        }
      },
    },
  });
}
