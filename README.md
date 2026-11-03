# d3llie.tech

Personal website built with Astro, TypeScript, Tailwind CSS, and WebTUI. The
site uses Astro server rendering with the Cloudflare adapter and is deployed as
a Cloudflare Worker.

## Local development

Requirements: Node.js 18.17 or newer and npm.

```sh
npm ci
npm run dev
```

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
