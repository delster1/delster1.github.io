import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";

import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // if you later use a custom domain, update this
  site: "https://delster1.github.io",

  output: "static",
  integrations: [react(), mdx()],

  markdown: {
    // optional, tweak as you like
    remarkPlugins: [],
    rehypePlugins: []
  },

  vite: {
    plugins: [tailwindcss()]
  }
});