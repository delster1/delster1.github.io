# Database Implementation Plan (Better-auth)

This document outlines the steps to connect the Gemini CLI website to a persistent database for authentication and user management, specifically focusing on using an external database server.

## 0. What is an ORM?
An **ORM (Object-Relational Mapper)** is a tool that allows you to interact with your database using TypeScript/JavaScript instead of writing raw SQL.
- **Abstraction:** It maps database tables to code objects.
- **Type Safety:** It ensures your queries match your schema at compile time, reducing runtime errors.
- **Productivity:** It simplifies complex joins and migrations into readable code.
- **Example:** Instead of `SELECT * FROM users`, you write `db.select().from(users)`.

## 1. Prerequisites
- **Astro Output:** Change `output: "static"` to `output: "server"` or `output: "hybrid"` in `astro.config.mjs`.
- **Hosting Adapter:** Install an adapter suitable for your environment (e.g., `@astrojs/node` or `@astrojs/cloudflare`).
- **External DB Access:** Ensure your external server's firewall allows incoming connections on the DB port (e.g., 5432 for Postgres) from your hosting provider's IP.

## 2. Recommended Stack
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (Type-safe and lightweight).
- **Database:** PostgreSQL (Recommended for external servers) or MySQL.
- **Driver:** `postgres.js` or `pg` for PostgreSQL.

## 3. Implementation Steps

### A. Install Dependencies
```bash
npm install drizzle-orm postgres @better-auth/drizzle-adapter
npm install -D drizzle-kit
```

### B. Configure Database Connection
Create `src/db/index.ts` to initialize your database client. For an external Postgres server:
- will add music history, book plans, suggest book, etc. 

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
```

### C. Update Better-auth Configuration (`src/auth.ts`)
```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import * as schema from "./db/schema";
import { db } from "./db";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // Use "pg" for PostgreSQL
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
- `DATABASE_URL`: `postgres://user:password@external-host:5432/database_name`
- `BETTER_AUTH_SECRET`: A long random string.
- `BETTER_AUTH_URL`: The base URL of your site.

## 5. Security Notes
- **SSL:** Use `?sslmode=require` in your connection string for external servers.
- **Pooling:** For high traffic, consider a connection pooler like PgBouncer.
- **Middleware:** Ensure `src/middleware.ts` is correctly verifying sessions on every server-side request.
