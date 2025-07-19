import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'

export default defineNuxtPlugin(async (nuxtApp) => {
    nuxtApp.vueApp.use(Particles, {
        init: async (engine) => {
            try {
                await loadSlim(engine)
            } catch (error) {
                console.error('Error initializing particles:', error)
            }
        },
    })
})
