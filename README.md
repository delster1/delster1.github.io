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

When available, the build reads `global/public/now.md` and `global/quotes.md`
from the local Obsidian checkout configured by `OBSIDIAN_NOTES_DIR` (default:
`/home/d3/Documents/obsidiannotes`). Cloudflare builds do not have that private
checkout, so they use empty-content fallbacks unless `SITE_NOW_CONTENT` and
`SITE_QUOTES_CONTENT` are set as build variables. Those values are bundled into
the public site; only put public content there. Restart the dev server or
rebuild after changing either source.

The build reads the current book from the public Goodreads profile and bundles
it into the site. Goodreads returns HTTP 403 to Cloudflare Workers, so the
homepage must not fetch the profile at request time. The old shelf RSS endpoint
returns 404; no RSS/API key is needed. The displayed book refreshes on each
build/deploy. Keep the profile public in Goodreads Account Settings → Profile
and Settings → Privacy. If a build cannot read the profile or its current-book
metadata, the homepage displays an unavailable message and the profile link.

## Background appearance

The wallpaper gallery is maintained in [`src/data/wallpapers.ts`](./src/data/wallpapers.ts).
Add each image there with a unique ID, display name, and public image URL.
Visitors can choose a gallery image or turn the image off at `/appearance`;
their choice is saved only in their browser. The owner can change the
site-wide default from the protected `/dashboard`; that setting is stored in
PostgreSQL and applies to visitors who use “Site default.”

Palette accents are sampled in the browser when the image host allows CORS.
For other hosts, add a `palette` to the wallpaper entry with `accent`,
`accentInk`, `panelTint`, and `glow` values. The dark scrim, panel surfaces, and
primary text colors stay constrained for readability. Keep images reasonably
compressed because they are loaded by site visitors.

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

Admin access uses the fixed username `delster1` and a password provided through
the `ADMIN_PASSWORD` deployment secret. See the [deployment guide](./deploy.md)
for secure configuration and the required database migration.
