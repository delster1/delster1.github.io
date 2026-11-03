# d3llie.tech

Personal website built with Astro, TypeScript, Tailwind CSS, and WebTUI. The
site uses Astro server rendering with the Cloudflare adapter and is deployed as
a Cloudflare Worker.

## Local development

Requirements: Node.js 18.17 or newer and npm.

```sh
npm ci
npm run db:dev:start
cp -n .env.example .env
npm run db:dev:generate
npm run db:dev:migrate
npm run dev
```

The local PostgreSQL container listens only on `127.0.0.1:55432` and uses its
own persistent Docker volume. It is separate from the production database and
any other local PostgreSQL service. The example credentials and auth secrets
are for local development only. Stop the container when finished with
`npm run db:dev:stop`.

The build reads `global/public/now.md` and `global/quotes.md` from the local
Obsidian checkout configured by `OBSIDIAN_NOTES_DIR` (default:
`/home/d3/Documents/obsidiannotes`) and bundles that content into the Worker.
Keep the notes checkout synced before building; restart the dev server or
rebuild after changing either file.

Useful checks:

```sh
npm run check
npm run build
```

## Deployment and data

- [Deployment guide](./deploy.md) — Worker build, Wrangler deployment,
  Cloudflare bindings, and runtime configuration.
- [Database and authentication](./db_implementation.md) — Better Auth,
  PostgreSQL, Drizzle, Hyperdrive, and migration notes.

The current deployment uses the `HYPERDRIVE` binding in [wrangler.jsonc](./wrangler.jsonc)
to connect the Worker to PostgreSQL. Do not commit credentials or secrets.

The website is a work in progress; authentication and admin access require
additional fixes before they should be relied on.
