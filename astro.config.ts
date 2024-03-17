import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import astroI18next from "astro-i18next";
import sitemap from "@astrojs/sitemap";
import { h } from "hastscript";
import { codeInspectorPlugin } from "code-inspector-plugin";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";

import rehypeExternalLinks from "rehype-external-links";
import rehypeMermaid from "rehype-mermaid";
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import rehypeShikiji from "rehype-shikiji";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

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
    icon({
      iconDir: "src/assets/icons",
      include: {
        mdi: ["rss", "search"], // Loads only Material Design Icon's "account" SVG
      },
    }),
    react(),
    astroI18next(),
    sitemap(),
    mdx(),
  ],
  markdown: {
    syntaxHighlight: false,
    rehypePlugins: [
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          content: () => h("span.iconfont.icon-link", { ariaHidden: "true" }),
          properties: {
            className: ["anchor"],
            ariaLabel: "Anchor",
            ariaHidden: "true",
            tabIndex: -1,
          },
        },
      ],
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
    plugins: [codeInspectorPlugin({ bundler: "vite" })],
  },
  scopedStyleStrategy: "where",
});
