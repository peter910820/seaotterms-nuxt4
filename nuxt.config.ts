import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  runtimeConfig: {
    // runtimeConfig.kurohelperApiUrl   ← NUXT_KUROHELPER_API_URL
    // runtimeConfig.kurohelperApiToken ← NUXT_KUROHELPER_API_TOKEN
    kurohelperApiUrl: "",
    kurohelperApiToken: "",
    public: {
      // runtimeConfig.public.apiUrl     ← NUXT_PUBLIC_API_URL
      // runtimeConfig.public.rootDomain ← NUXT_PUBLIC_ROOT_DOMAIN
      // runtimeConfig.public.siteUrl    ← NUXT_PUBLIC_SITE_URL
      apiUrl: "",
      rootDomain: "",
      siteUrl: "",
    },
  },
  build: {
    transpile: ["vuetify"],
  },
  vite: {
    plugins: [vuetify({ autoImport: true })],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  modules: ["@pinia/nuxt", ["motion-v/nuxt", { directives: true }]],
  plugins: ["@/plugins/nprogress.client.ts"],
  css: [
    "@/assets/scss/global.scss",
    "@/assets/scss/animates.scss",
    "@/assets/scss/button.scss",
    "@/assets/scss/loader.scss",
    "@/assets/scss/progress.scss",
  ],
  app: {
    head: {
      title: "SeaotterMSのblog",
      meta: [
        { name: "description", content: "放一些技術以及日常的東東" },
        { property: "og:title", content: "SeaotterMSのblog" },
        { property: "og:description", content: "放一些技術以及日常的東東" },
        { property: "og:type", content: "website" },
      ],
      script: [{ src: "https://cdn.jsdelivr.net/npm/typed.js@2.0.12", crossorigin: "anonymous", defer: true }],
    },
  },
});
