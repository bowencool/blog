import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import astroI18next from "astro-i18next";
import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from "rehype-external-links";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.bowen.cool",
  server: {
    host: "0.0.0.0",
  },
  // i18n: {
  //   defaultLocale: "en",
  //   locales: ["en", "zh"],
  // },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    astroI18next(),
    sitemap(),
    mdx(),
  ],
  markdown: {
    shikiConfig: {
      // theme: "css-variables",
      wrap: true,
    },
    rehypePlugins: [
      [rehypeExternalLinks, { target: "_blank", rel: ["noopener"] }],
    ],
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
