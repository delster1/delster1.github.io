# Database Implementation Plan (Better-auth)

This document outlines the steps to connect the Gemini CLI website to a persistent database for authentication and user management.

## 1. Prerequisites
- **Astro Output:** Change `output: "static"` to `output: "server"` or `output: "hybrid"` in `astro.config.mjs`.
- **Hosting Adapter:** Install an adapter suitable for your environment (e.g., `@astrojs/node` or `@astrojs/cloudflare`).

## 2. Recommended Stack
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (Type-safe and lightweight).
- **Database:** PostgreSQL (Standard) or SQLite/Turso (Simple/Edge).

## 3. Implementation Steps

### A. Install Dependencies
```bash
npm install drizzle-orm @better-auth/drizzle-adapter
npm install -D drizzle-kit
```

### B. Configure Database Connection
Create a `src/db/index.ts` to initialize your database client (e.g., using `postgres` or `libsql`).

### C. Update Better-auth Configuration (`src/auth.ts`)
```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import * as schema from "./db/schema";
import { db } from "./db";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // Change based on your DB
        schema: schema,
    }),
    emailAndPassword: {
        enabled: true,
    }
});
```

### D. Schema Management
1. Use `npx better-auth migrate` to generate the initial authentication tables.
2. Maintain your custom tables in `src/db/schema.ts`.

## 4. Environment Variables
Ensure the following are set in your `.env` and production environment:
- `DATABASE_URL`: Connection string to your DB.
- `BETTER_AUTH_SECRET`: A long random string.
- `BETTER_AUTH_URL`: The base URL of your site.

## 5. Security Notes
- Better-auth handles password hashing and session management automatically.
- Ensure `src/middleware.ts` is correctly verifying sessions on every server-side request.
