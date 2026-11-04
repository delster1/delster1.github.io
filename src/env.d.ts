
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
    type SiteRuntime = import("@astrojs/cloudflare").Runtime<{
        HYPERDRIVE?: { connectionString: string };
        ADMIN_PASSWORD?: string;
        AUTH_SECRET?: string;
        GITHUB_CONTENT_TOKEN?: string;
        DATABASE_URL?: string;
        BETTER_AUTH_DATABASE_URL?: string;
        AUTH_DB?: string;
        BETTER_AUTH_URL?: string;
    }>;

    interface Locals extends SiteRuntime {
        isAdmin: boolean;
    }
}
