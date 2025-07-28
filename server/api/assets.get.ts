import { readdir } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
    const publicDir = join(process.cwd(), 'public', 'assets')

    const getFilesFromDirectory = async (relativePath: string, extensions: string[]) => {
        try {
            const fullPath = join(publicDir, relativePath)
            const files = await readdir(fullPath)

            return files
                .filter((file) => {
                    const ext = file.toLowerCase().split('.').pop()
                    return ext && extensions.includes(ext)
                })
                .map((file) => file.toLowerCase())
        } catch (error: any) {
            console.error(`Error reading directory ${relativePath}:`, error)
            return []
        }
    }

    const [confettiImages, spinningAudio, selectedAudio] = await Promise.all([
        getFilesFromDirectory('images/confetti', ['png', 'jpg', 'jpeg', 'gif', 'webp']),
        getFilesFromDirectory('mp3/spinning', ['mp3', 'wav', 'ogg']),
        getFilesFromDirectory('mp3/selected', ['mp3', 'wav', 'ogg']),
    ])

    return {
        confettiImages: confettiImages.map((file) => `/assets/images/confetti/${file}`),
        spinningAudio: spinningAudio.map((file) => `/assets/mp3/spinning/${file}`),
        selectedAudio: selectedAudio.map((file) => `/assets/mp3/selected/${file}`),
    }
})
