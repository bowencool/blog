import vercel from '@astrojs/vercel/serverless';
// import vercel from '@astrojs/vercel/static';

/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  output: 'server',
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
  defaultLocale: "en",
  // showDefaultLocale: true,
  locales: ["en", "zh"],
  namespaces: ["common", "tags"],
  defaultNamespace: "common",
  i18next: {
    debug: true, // convenient during development to check for missing keys
  },
  load: ["server", "client"], // load i18next server and client side
  i18nextServerPlugins: {
    "{initReactI18next}": "react-i18next",
  },
  i18nextClientPlugins: {
    "{initReactI18next}": "react-i18next",
  },
};