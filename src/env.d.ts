
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Environment {
    HYPERDRIVE?: { connectionString: string };
    SITE_SETTINGS_DB?: { connectionString: string };
    ADMIN_PASSWORD?: string;
    AUTH_SECRET?: string;
    AUTH_GITHUB_ID?: string;
    AUTH_GITHUB_SECRET?: string;
    BETTER_AUTH_URL?: string;
    D3_EMAIL?: string;
    GITHUB_CONTENT_TOKEN?: string;
    DATABASE_URL?: string;
    BETTER_AUTH_DATABASE_URL?: string;
    AUTH_DB?: string;
    ENABLE_LEGACY_AUTH?: string;
    ADMIN_LOGIN_LIMITER?: {
      limit: (options: { key: string }) => Promise<{ success: boolean }>;
    };
  }

  interface Locals {
    isAdmin: boolean;
  }
}

declare module "cloudflare:workers" {
  export const env: App.Environment;
}
