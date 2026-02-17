import { betterAuth } from "better-auth";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { drizzle } from "drizzle-orm/d1";
// import {
//   ALLOWED_EMAILS,
//   AUTH_GITHUB_ID,
//   AUTH_GITHUB_SECRET,
//   AUTH_SECRET,
//   BETTER_AUTH_URL,
//   D3_EMAIL,
// } from "astro:env/server";
//
require("dotenv").config();

const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS;
const AUTH_GITHUB_ID = process.env.AUTH_GITHUB_ID;
const AUTH_GITHUB_SECRET = process.env.AUTH_GITHUB_SECRET;
const AUTH_SECRET = process.env.AUTH_SECRET;
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL;
const D3_EMAIL = process.env.D3_EMAIL;
const DATABASE_URL = process.env.DATABASE_URL;

console.log(BETTER_AUTH_URL);
console.log(DATABASE_URL);

const allowedEmails = new Set(
  (ALLOWED_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
);
export const isEmailAllowed = (email) => {
  var emailVerified = false;
  for (const allowedEmail of allowedEmails) {
    console.log(email);
    console.log(allowedEmail);
    if (allowedEmail == email) {
      emailVerified = true;
    }
  }
  console.log(emailVerified);
  return emailVerified;
};

var adminUser = false;
const adminEmail = D3_EMAIL;

export const isEmailAdmin = (email) => {
  console.log("Admin email: " + adminEmail);
  if (adminUser == true) {
    console.log("admin");
    return true;
  }
  if (email == adminEmail) {
    console.log("admin");
    adminUser = true;
    return true;
  }
};

console.log(("CLIENT ID: " + AUTH_GITHUB_ID) as string);
export const auth = betterAuth({
  database: drizzle(DATABASE_URL),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: BETTER_AUTH_URL || "http://localhost:4321",
  secret: AUTH_SECRET,
  socialProviders: {
    github: {
      clientId: AUTH_GITHUB_ID,
      clientSecret: AUTH_GITHUB_SECRET,
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
