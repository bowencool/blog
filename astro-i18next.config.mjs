/** @type {import('astro-i18next').AstroI18nextConfig} */
export default {
  defaultLocale: "en",
  // showDefaultLocale: true,
  locales: ["en", "zh"],
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