# Database and Authentication

This document describes the database and authentication setup that is present
in the site. It replaces the earlier implementation plan, which described
installing and configuring components that are already in the repository.

## Request and data flow

```text
Browser
  -> Astro route / middleware on the Cloudflare Worker
  -> Site settings API -> pg Client -> SITE_SETTINGS_DB -> settings PostgreSQL
  -> Better Auth API -> HYPERDRIVE -> legacy auth PostgreSQL
```

- **Better Auth** provides the legacy GitHub OAuth API.
- The protected admin dashboard uses an owner-only password flow. Its password
  is a Cloudflare secret, and its signed 12-hour session is an HTTP-only cookie
  protected with `AUTH_SECRET`.
- **Drizzle ORM** maps the TypeScript schema to PostgreSQL tables.
- **Hyperdrive** is Cloudflare's connection layer for PostgreSQL. It provides
  pooled connections between Workers and the database; it is not itself a
  database and does not create or migrate one.
- The Worker receives separate bindings from [wrangler.jsonc](./wrangler.jsonc):
  `HYPERDRIVE` remains dedicated to Better Auth, and `SITE_SETTINGS_DB` connects
  the settings-only database. Connection credentials are configured in
  Cloudflare and should not be committed to the repository.

## Relevant files

- [src/auth.ts](./src/auth.ts) configures Better Auth, its Drizzle adapter,
  database connection, and signup checks.
- [src/middleware.ts](./src/middleware.ts) verifies the signed admin cookie.
- [src/pages/api/auth/[...all].ts](./src/pages/api/auth/%5B...all%5D.ts) forwards
  auth API requests to Better Auth.
- [src/db/schema.ts](./src/db/schema.ts) defines the auth tables and
  `site_settings`.
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
- `ADMIN_PASSWORD` — the admin password for username `delster1`; set it as a
  Worker secret and use at least 16 characters.

The middleware verifies the admin cookie on every request. `/dashboard` and
the default-wallpaper update endpoint both require that session. The password
is not stored in PostgreSQL. The default wallpaper ID is stored in
`site_settings`; visitor-selected appearance preferences remain browser-local.
The legacy Better Auth GitHub endpoint still checks verified emails against
`D3_EMAIL`, but it does not grant admin access.

The site settings code uses `SITE_SETTINGS_DB` in production and `DATABASE_URL`
as a local direct-connection fallback. Better Auth continues to use
`HYPERDRIVE`; the settings code does not fall back to the auth database.
Drizzle Kit separately requires `DATABASE_URL` for direct migration operations.
Do not store either database credentials or auth secrets in source control.

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

## Local admin testing

Set `ADMIN_PASSWORD` in the ignored local `.env` file and use the local
`AUTH_SECRET` from `.env.example`. The password must be at least 16 characters.
Do not reuse production secrets for local testing.
