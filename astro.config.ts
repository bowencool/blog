import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import astroI18next from "astro-i18next";
import sitemap from "@astrojs/sitemap";
import { SITE } from "./src/config";

// https://astro.build/config
export default defineConfig({
  site: SITE.website,
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
  ],
  markdown: {
    remarkPlugins: [
      [remarkToc, { heading: "(Table of contents)|toc|目录" }],
      [
        remarkCollapse,
        {
          test: "(Table of contents)|toc|目录",
          summary(title: string) {
            // const isEnglish = title.match(/^[a-z\s]+$/i);
            const isChinese = title.match(/[\u4e00-\u9fa5]/);
            const prefix = isChinese ? "打开" : "Open ";
            return prefix + title;
          },
        },
      ],
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true,
    },
  },
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
  scopedStyleStrategy: "where",
});
