import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import "dotenv/config";
import { Pool } from "pg";

const allowedEmails = new Set(
  (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);
export const isEmailAllowed = (email) => {
  var emailVerified = false;
  for (const allowedEmail of allowedEmails) {
      console.log(email)
      console.log(allowedEmail)
    if (allowedEmail == email) {
      emailVerified = true;
    }
  }
  console.log(emailVerified);
  return emailVerified;
};

var adminUser = false
const adminEmail = process.env.D3_EMAIL

export const isEmailAdmin = (email) => {
    console.log("Admin email: " + adminEmail)
    if (adminUser == true) {
        console.log("admin")
        return true
    }
    if (email == adminEmail) {
        console.log("admin")
        adminUser = true
        return true
    }

}

console.log(("CLIENT ID: " + process.env.AUTH_GITHUB_ID) as string);
export const auth = betterAuth({
    database: new Pool({
    connectionString: "postgres://postgres:R0ck3tL3agu369!@581db.d3llie.tech:5432/betterauth_db",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4321",
  secret: process.env.AUTH_SECRET!,
  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    },
  },
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
