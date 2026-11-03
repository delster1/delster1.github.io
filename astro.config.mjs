import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

import tailwindcss from "@tailwindcss/vite";

import cloudflare from "@astrojs/cloudflare";

const obsidianNotesDir = resolve(
  process.env.OBSIDIAN_NOTES_DIR || "/home/d3/Documents/obsidiannotes"
);

function readObsidianContent(relativePath) {
  const filePath = resolve(obsidianNotesDir, relativePath);
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(
      `Unable to read ${filePath}. Set OBSIDIAN_NOTES_DIR to the local Obsidian checkout.`,
      { cause: error }
    );
  }
}

const siteContent = {
  now: readObsidianContent("global/public/now.md"),
  quotes: readObsidianContent("global/quotes.md"),
};

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
      DATABASE_URL: envField.string({ context: "server", access: "secret", optional: true }),
      DB_PASSWORD: envField.string({ context: "server", access: "secret", optional: true }),
      PGPASSWORD: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },

  vite: {
    define: {
      __SITE_CONTENT__: JSON.stringify(siteContent),
    },
    plugins: [tailwindcss()]
  },

  adapter: cloudflare()
});
