# Deployment Guide: Cloudflare Pages (SSR)

This project is configured to use **Astro SSR** with the **Cloudflare Adapter**. Follow these steps to deploy.

## 1. Prerequisites
- A [Cloudflare Account](https://dash.cloudflare.com/).
- A persistent database (e.g., Neon, Supabase, or Turso) as required by `better-auth`.
- Your code pushed to a GitHub repository.

## 2. Cloudflare Pages Setup
1. Log in to the Cloudflare Dashboard and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository.
3. **Build settings**:
   - **Framework preset**: `Astro`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**. (The first build might fail until you add environment variables).

## 3. Environment Variables
In the Cloudflare Dashboard, go to **Settings** > **Environment Variables** and add:

| Variable | Description |
| :--- | :--- |
| `BETTER_AUTH_URL` | `https://d3llie.tech` (or your preview URL) |
| `AUTH_SECRET` | A random 32-character string |
| `AUTH_GITHUB_ID` | From GitHub OAuth App settings |
| `AUTH_GITHUB_SECRET` | From GitHub OAuth App settings |
| `DATABASE_URL` | Your DB connection string |
| `ALLOWED_EMAILS` | Comma-separated list of invited users |
| `D3_EMAIL` | Your admin email (e.g., `delsterone@gmail.com`) |

*Note: You must add these to both **Production** and **Preview** environments in Cloudflare.*

## 4. Custom Domain
1. In Cloudflare Pages, go to **Custom domains**.
2. Add `d3llie.tech`.
3. Cloudflare will automatically handle the DNS and SSL certificate if your domain is managed by them.

## 5. Local Development
To test the production-like environment locally:
```bash
npm run build
npx wrangler pages dev dist
```
