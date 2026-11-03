
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
    type SiteRuntime = import("@astrojs/cloudflare").Runtime<{
        HYPERDRIVE?: { connectionString: string };
        DATABASE_URL?: string;
        BETTER_AUTH_DATABASE_URL?: string;
        AUTH_DB?: string;
        BETTER_AUTH_URL?: string;
    }>;

    interface Locals extends SiteRuntime {
        user: import("better-auth").User | null;
        session: import("better-auth").Session | null;
    }
}
