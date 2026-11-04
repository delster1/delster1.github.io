# Deployment Guide: Cloudflare Workers

This site is an Astro server-rendered application deployed as a **Cloudflare
Worker**. It uses the Astro Cloudflare adapter and Wrangler; it is not currently
configured as a Cloudflare Pages project.

The Cloudflare dashboard shows the `delster1-github-io` production Worker
serving `d3llie.tech`, connected to this GitHub repository's `main` branch.
Worker Builds use `npm run build` followed by `npx wrangler deploy`, so a push
to `main` triggers a production build and deployment. Check the Cloudflare
build page if a push does not produce a new build.

## How deployment is configured

- [astro.config.mjs](./astro.config.mjs) enables server rendering and the
  Cloudflare adapter.
- [wrangler.jsonc](./wrangler.jsonc) identifies the generated Worker entry
  point (`dist/_worker.js/index.js`), serves assets from `dist`, and declares
  the `HYPERDRIVE` database binding.
- `npm run build` creates the Worker and its assets. Cloudflare Worker Builds
  run `npx wrangler deploy` after a successful build.
- `d3llie.tech` is configured as the production custom domain in Cloudflare.
- The build reads the “Now” note and quote list from a local Obsidian checkout
  when available. Cloudflare has no access to that private checkout, so its
  build uses empty-content fallbacks unless public text is provided with the
  `SITE_NOW_CONTENT` and `SITE_QUOTES_CONTENT` build variables. The deployed
  site does not call the old `minipc.d3llie.tech` content API.

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

For local development, the build reads
`/home/d3/Documents/obsidiannotes/global/public/now.md` and
`/home/d3/Documents/obsidiannotes/global/quotes.md` when they exist. Set
`OBSIDIAN_NOTES_DIR` to use another local checkout. In production, the Worker
fetches those two files directly from the private
`delster1/obsidianNotes` repository using a `GITHUB_CONTENT_TOKEN` secret. It
refreshes the in-memory copy every five minutes; the token is never sent to
visitors or included in build output. If the secret is not configured or GitHub
is unavailable, the Worker logs the fetch failure and falls back to bundled
content.

## Cloudflare bindings and secrets

Configure production values under the Worker’s **Settings > Variables and
Secrets**. Keep secrets in Cloudflare or a local, ignored development secrets
file; never commit them.

| Name | Purpose |
| --- | --- |
| `BETTER_AUTH_URL` | Public base URL for Better Auth; production value is `https://d3llie.tech`. |
| `AUTH_SECRET` | Strong secret used by Better Auth and to sign admin sessions; use at least 32 characters. |
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID. |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret. |
| `GITHUB_CONTENT_TOKEN` | Fine-grained GitHub token with read-only Contents access to `delster1/obsidianNotes`; used only to fetch the public Now and quote files. |
| `D3_EMAIL` | Owner email allow-list for the legacy GitHub OAuth API; it does not grant dashboard access. |
| `ADMIN_PASSWORD` | Secret password for the fixed admin username `delster1`; use at least 16 characters. |

Set the admin password without putting it in a shell command or source file:

```sh
npx wrangler secret put AUTH_SECRET
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put GITHUB_CONTENT_TOKEN
```

Wrangler prompts for each value. Set `AUTH_SECRET` to a separate, strong value
of at least 32 characters; it signs the admin's 12-hour, HTTP-only session
cookie. Set `ADMIN_PASSWORD` to a password of at least 16 characters for the
fixed username `delster1`. You can also add both as secrets under the Worker's
**Settings > Variables and Secrets** in Cloudflare. Never put either value in
the build variables, repository, or chat. The legacy Better Auth GitHub API
still uses the GitHub credentials and `D3_EMAIL`; it is not used for admin
dashboard access.

Create `GITHUB_CONTENT_TOKEN` in GitHub as a fine-grained personal access token
limited to the `obsidianNotes` repository, with **Contents: Read-only** access
and no other permissions. Enter it only at the Wrangler prompt or in the
Cloudflare secret form. Do not reuse your general-purpose GitHub CLI token.

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

The admin background setting uses the `site_settings` table. Apply its checked-in
migration to the production database before deploying the dashboard feature.
Provide the production `DATABASE_URL` privately to Drizzle Kit (for example via
an ignored local `.env` file), then run:

```sh
npx drizzle-kit migrate
```

Do not pass the database URL or admin password as command-line arguments.

For background on the database and auth components, see
[db_implementation.md](./db_implementation.md).
