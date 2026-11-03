# Deployment Guide: Cloudflare Workers

This site is an Astro server-rendered application deployed as a **Cloudflare
Worker**. It uses the Astro Cloudflare adapter and Wrangler; it is not currently
configured as a Cloudflare Pages project.

At the time this guide was updated, the Cloudflare dashboard showed the
`delster1-github-io` production Worker serving `d3llie.tech`. Its deployments
were manual Wrangler deployments, and preview deployments were disabled. A
GitHub push alone should not be assumed to deploy the site.

## How deployment is configured

- [astro.config.mjs](./astro.config.mjs) enables server rendering and the
  Cloudflare adapter.
- [wrangler.jsonc](./wrangler.jsonc) identifies the generated Worker entry
  point (`dist/_worker.js/index.js`), serves assets from `dist`, and declares
  the `HYPERDRIVE` database binding.
- `npm run build` creates the Worker and its assets. `npx wrangler deploy`
  publishes them.
- `d3llie.tech` is configured as the production custom domain in Cloudflare.

The old Pages-specific instructions (`Connect to Git`, Pages build settings,
and `wrangler pages dev`) do not describe the current setup.

## Prerequisites

- Node.js 18.17 or newer and npm.
- Access to this repository and a Cloudflare account authorized to deploy the
  `delster1-github-io` Worker.
- A configured Cloudflare Hyperdrive resource for the PostgreSQL database if
  database-backed authentication is to be used.
- A GitHub OAuth app if GitHub sign-in is to be used.

## Local development and deployment

Install the exact dependencies from the lockfile, then run Astro locally:

```sh
npm ci
npm run dev
```

For a built Worker preview, build first and then start Wrangler:

```sh
npm run build
npx wrangler dev
```

The preview needs valid local runtime configuration to exercise authentication
or database-backed routes. In particular, do not assume that a local preview
can access production secrets or the production database automatically.

To publish to the configured Cloudflare account:

```sh
npm run check
npm run build
npx wrangler login
npx wrangler deploy
```

`npx wrangler login` is only needed when the local Wrangler session is not
already authenticated. Confirm the deployment in the Cloudflare dashboard and
then visit `https://d3llie.tech`. Use the Worker logs in Cloudflare to diagnose
runtime errors.

## Cloudflare bindings and secrets

Configure production values under the Worker’s **Settings > Variables and
Secrets**. Keep secrets in Cloudflare or a local, ignored development secrets
file; never commit them.

| Name | Purpose |
| --- | --- |
| `BETTER_AUTH_URL` | Public base URL for Better Auth; production value is `https://d3llie.tech`. |
| `AUTH_SECRET` | Secret used by Better Auth to sign/encrypt auth data. Generate a strong random value. |
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID. |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret. |
| `D3_EMAIL` | Optional admin email used by the current auth code. |
| `ALLOWED_EMAILS` | Comma-separated signup allow-list used by the current auth code. Although declared optional in the Astro schema, the code currently reads it as required. |

Set the GitHub OAuth callback URL to
`https://d3llie.tech/api/auth/callback/github` for production. Configure any
local or preview callback URLs separately if those environments are used.

The Worker’s `HYPERDRIVE` binding is declared in [wrangler.jsonc](./wrangler.jsonc)
and points to a Hyperdrive resource configured in Cloudflare. The database
connection string and credentials belong in that Cloudflare resource, not in
this repository. `DATABASE_URL` is an optional direct-connection fallback in
the application and is also read by [drizzle.config.ts](./drizzle.config.ts)
when running Drizzle Kit migrations.

## Database migrations

Deploying the Worker does **not** apply database migrations. Review the
generated SQL in `drizzle/` and compare it with
[src/db/schema.ts](./src/db/schema.ts) before applying changes. The checked-in
initial migration may not include every field currently present in the TypeScript
schema.

Drizzle Kit uses `DATABASE_URL` from the local process for direct database
operations. Keep that value private and provide it only in your local
environment when generating or applying migrations. Do not use a production
migration as an automatic step in every Worker deploy.

## Current authentication caveat

Authentication is still a work in progress. The signup allow-list and admin
checks in `src/auth.ts` have known implementation issues, and the dashboard
route should not be treated as a protected admin area until those are fixed and
verified. Successful deployment does not mean login or access control is
working correctly.

For background on the database and auth components, see
[db_implementation.md](./db_implementation.md).
