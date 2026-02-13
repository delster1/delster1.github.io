import { defineConfig } from "astro/config";
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

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: cloudflare()
});