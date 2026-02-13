import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  // if you later use a custom domain, update this
  site: "https://d3llie.tech",

  output: "server",
  integrations: [react(), mdx()],

  markdown: {
    // optional, tweak as you like
    remarkPlugins: [],
    rehypePlugins: []
  },

  env: {
    schema: {
      BETTER_AUTH_URL: envField.string({ context: "server", access: "public" }),
      AUTH_SECRET: envField.string({ context: "server", access: "secret" }),
      AUTH_GITHUB_ID: envField.string({ context: "server", access: "secret" }),
      AUTH_GITHUB_SECRET: envField.string({ context: "server", access: "secret" }),
      D3_EMAIL: envField.string({ context: "server", access: "secret", optional: true }),
      ALLOWED_EMAILS: envField.string({ context: "server", access: "secret", optional: true }),
      DATABASE_URL: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: cloudflare()
});