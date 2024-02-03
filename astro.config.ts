import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import astroI18next from "astro-i18next";
import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from "rehype-external-links";
import rehypeMermaid from "rehype-mermaid";
import rehypeShikiji from "rehype-shikiji";

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
    syntaxHighlight: false,
    rehypePlugins: [
      [rehypeExternalLinks, { target: "_blank", rel: ["noopener"] }],
      [rehypeMermaid, { dark: true, strategy: "img-svg" }],
      [
        rehypeShikiji,
        {
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
          wrap: true,
        },
      ],
    ],
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
