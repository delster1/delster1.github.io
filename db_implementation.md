# Database and Authentication

This document describes the database and authentication setup that is present
in the site. It replaces the earlier implementation plan, which described
installing and configuring components that are already in the repository.

## Request and data flow

```text
Browser
  -> Astro route / middleware on the Cloudflare Worker
  -> Better Auth
  -> Drizzle adapter and PostgreSQL driver
  -> Cloudflare Hyperdrive
  -> PostgreSQL database
```

- **Better Auth** implements email/password and GitHub sign-in, and manages
  sessions.
- **Drizzle ORM** maps the TypeScript schema to PostgreSQL tables.
- **Hyperdrive** is Cloudflare's connection layer for the database. It provides
  pooled connections between Workers and the existing PostgreSQL database; it
  is not itself a database and does not create or migrate the database.
- The Worker receives the Hyperdrive connection through the `HYPERDRIVE`
  binding declared in [wrangler.jsonc](./wrangler.jsonc). The connection details
  are configured in Cloudflare and should not be committed to the repository.

## Relevant files

- [src/auth.ts](./src/auth.ts) configures Better Auth, its Drizzle adapter,
  database connection, and signup checks.
- [src/middleware.ts](./src/middleware.ts) looks up the current session and
  attaches the user and session to Astro locals.
- [src/pages/api/auth/[...all].ts](./src/pages/api/auth/%5B...all%5D.ts) forwards
  auth API requests to Better Auth.
- [src/db/schema.ts](./src/db/schema.ts) defines the users, sessions, accounts,
  and verification-token tables.
- [drizzle.config.ts](./drizzle.config.ts) configures Drizzle Kit to use that
  schema and read a direct PostgreSQL URL from `DATABASE_URL`.
- `drizzle/` contains checked-in SQL migration files.

## Configuration

In production, the Worker needs the Better Auth settings in Cloudflare
**Settings > Variables and Secrets**:

- `BETTER_AUTH_URL` — the site's base URL, `https://d3llie.tech`.
- `AUTH_SECRET` — a strong, private Better Auth secret.
- `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` — GitHub OAuth app credentials.
- `D3_EMAIL` — the site owner's email address from the GitHub OAuth profile.
  Account creation is denied unless this value is configured and matches.

Authentication is GitHub-only; email/password sign-up and sign-in are disabled.
The user-creation hook rejects new accounts unless GitHub supplies a verified
email matching `D3_EMAIL`, and `/dashboard` checks the same owner email on the
server for every request. Existing accounts that do not match cannot access
the dashboard.

The app uses `HYPERDRIVE` first for database access, with `DATABASE_URL` as a
fallback. Drizzle Kit separately requires `DATABASE_URL` for direct migration
operations. Do not store either database credentials or auth secrets in source
control.

## Migrations

The migration files are not run automatically during deployment. Before applying
or generating migrations:

1. Compare the SQL files in `drizzle/` against `src/db/schema.ts`. The initial
   checked-in migration may be behind the current schema.
2. Provide `DATABASE_URL` privately in the environment running Drizzle Kit.
3. Review generated SQL and back up production data before applying a migration
   to the production database.

For deployment steps and the current Cloudflare Worker setup, see
[deploy.md](./deploy.md).

## Local OAuth testing

The local `.env` example uses placeholder GitHub OAuth credentials. To test the
OAuth round trip, configure a separate GitHub OAuth App with a callback URL of
`http://localhost:4321/api/auth/callback/github`, then set its credentials and
the owner's email in the ignored local `.env`. Do not reuse production secrets
for local testing.
