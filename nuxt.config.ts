// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxthub/core",
    "@nuxt/content",
    "nuxt-auth-utils",
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/i18n",
  ],
  nitro: {
    experimental: {
      openAPI: true,
    },
  },
  hub: {
    blob: true,
    cache: true,
    database: true,
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./app/components/ui"
     */
    componentDir: "./app/components/ui",
  },
  i18n: {
    locales: [
      {
        code: "en",
        language: "en-US",
      },
      {
        code: "vi",
        language: "vi-VN",
      },
    ],
    defaultLocale: "vi",
    detectBrowserLanguage: false,
  },
});
