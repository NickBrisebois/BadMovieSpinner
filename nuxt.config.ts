// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-05-15',
    devtools: { enabled: true },
    modules: ['@nuxt/icon', '@nuxt/ui'],
    plugins: [{ src: '~/plugins/vue3-particles.client.ts', mode: 'client' }],
    build: {
        transpile: ['@tsparticles/vue3'],
    },
})
