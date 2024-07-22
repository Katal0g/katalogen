// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  colorMode: {
    preference: "light",
  },
  compatibilityDate: "2024-07-20",
  css: ["~/assets/css/main.css"],
  devtools: { enabled: true },
  modules: [
    "@nuxt/ui",
    [
      "@nuxtjs/i18n",
      {
        i18n: {
          vueI18n: "./i18n.config.ts",
        },
      },
    ],
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  ui: {
    icons: ["mdi", "heroicons"],
  },
});
