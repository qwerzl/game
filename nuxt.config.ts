// https://nuxt.com/docs/api/configuration/nuxt-config
import glsl from 'vite-plugin-glsl';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxt/fonts",
    "shadcn-nuxt",
    "@nuxt/icon",
    "@nuxt/image",
    "@pinia/nuxt",
    '@tresjs/nuxt',
  ],
  vite: {
    plugins: [glsl()]
  },
  routeRules: {
    // Homepage pre-rendered at build time
    '/game': { ssr: false },
  }
})
