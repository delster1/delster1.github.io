import { betterAuth } from "better-auth"
import "dotenv/config";

export const d3_ID = process.env.D3_ID!;
console.log("CLIENT ID: " + process.env.AUTH_GITHUB_ID as string)
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4321",
  secret: process.env.AUTH_SECRET!,
  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    },
  },
})
