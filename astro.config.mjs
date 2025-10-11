c/ astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://delster1.github.io", // if you later use a custom domain, update this
  output: "static",
  integrations: [react(), mdx()],
  markdown: {
    // optional, tweak as you like
    remarkPlugins: [],
    rehypePlugins: []
  }
});

