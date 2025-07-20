import { confetti } from '@tsparticles/confetti'
import { ref, computed } from 'vue'
import type { BadMovie } from '~/shared/types/movie'

export const useSpinnerWheel = async () => {
    const size = 400
    const spinTime = 10000

    const selectedIndex = ref<number | null>(null)
    const spinContainer = ref<HTMLElement | null>(null)
    const spinWheel = ref<SVGSVGElement | null>(null)
    const currDeg = ref(0)
    const animationFrame = ref<number | null>(null)
    const isSpinning = ref(false)
    const hoveredIndex = ref<number | null>(null)

    const spinIntensity = ref<'gentle' | 'normal' | 'intense'>('normal')

    const badMoviesFetch = await useFetch('/api/sheets', {
        method: 'GET',
        query: { oneMoviePerPerson: false },
        headers: { 'Content-Type': 'application/json' },
    })
    const badMoviesResponse = badMoviesFetch.data
    const randomPicksObj = computed(
        () => badMoviesResponse.value?.randomPicks || ({} as Record<string, BadMovie[]>),
    )
    const watchedMovies = computed(
        () => badMoviesResponse.value?.watchedMovies || ({} as Record<string, BadMovie[]>),
    )
    const people = computed(() => Object.keys(randomPicksObj.value))
    const moviesByPerson = computed(() =>
        people.value.map((person) => randomPicksObj.value[person] || []),
    )
    const numPeople = computed(() => people.value.length)
    const spinnerMovieSegments = computed(() => {
        const arr: {
            movie: BadMovie
            person: string
            globalIndex: number
            personIndex: number
            sliceStartAngle: number
            sliceEndAngle: number
        }[] = []
        let globalIndex = 0
        let sectorStart = 0
        for (let p = 0; p < numPeople.value; p++) {
            const person = people.value[p]
            const movies = moviesByPerson.value[p]
            const sectorAngle = 360 / numPeople.value
            const sliceAngle = sectorAngle / movies.length
            for (let m = 0; m < movies.length; m++) {
                const sliceStartAngle = sectorStart + m * sliceAngle
                const sliceEndAngle = sliceStartAngle + sliceAngle
                arr.push({
                    movie: movies[m],
                    person,
                    globalIndex,
                    personIndex: m,
                    sliceStartAngle,
                    sliceEndAngle,
                })
                globalIndex++
            }
            sectorStart += sectorAngle
        }
        return arr
    })

    watch(selectedIndex, (newIndex, oldIndex) => {
        if (isSpinning.value && newIndex !== oldIndex && newIndex !== null) {
            if ('vibrate' in navigator) {
                navigator.vibrate(50)
            }
        }
    })

    const confettiImages = [
        '/assets/images/confetti.png',
        '/assets/images/confetti2.png',
        '/assets/images/confetti3.png',
        '/assets/images/confetti4.png',
        '/assets/images/confetti5.png',
        '/assets/images/confetti6.png',
    ]

    const spinningAudio = [
        '/assets/mp3/spinning/spin.mp3',
        '/assets/mp3/spinning/spin2.mp3',
        '/assets/mp3/spinning/spin3.mp3',
        '/assets/mp3/spinning/spin4.mp3',
    ]

    const selectedAudio = [
        '/assets/mp3/selected/selected.mp3',
        '/assets/mp3/selected/selected2.mp3',
        '/assets/mp3/selected/selected3.mp3',
        '/assets/mp3/selected/selected4.mp3',
        '/assets/mp3/selected/selected5.mp3',
        '/assets/mp3/selected/selected6.mp3',
    ]

    async function burstConfetti() {
        const spinnerElement = spinContainer.value
        if (!spinnerElement) return

        const rect = spinnerElement.getBoundingClientRect()
        const centreX = (rect.left + rect.width / 2) / window.innerWidth
        const centreY = (rect.top + rect.height / 2) / window.innerHeight

        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                confetti('tsparticles', {
                    shapes: ['image'],
                    shapeOptions: {
                        image: [
                            {
                                src: confettiImages[
                                    Math.floor(Math.random() * confettiImages.length)
                                ],
                                width: 80,
                                height: 80,
                            },
                        ],
                    },
                    particleCount: 50,
                    scalar: 6.0,
                    gravity: 0.4,
                    drift: 0.1,
                    ticks: 300,
                    startVelocity: 25 + i * 5,
                    zIndex: 1000,
                    origin: {
                        x: centreX,
                        y: centreY,
                    },
                    angle: 90,
                    spread: 60 + i * 20,
                })
            }, i * 500)
        }
    }

    function getCurrentSliceIndex(rotation: number): number {
        const normalizedDeg = (360 - (rotation % 360)) % 360
        const sliceIndex = spinnerMovieSegments.value.findIndex(
            (entry) =>
                normalizedDeg >= entry.sliceStartAngle && normalizedDeg < entry.sliceEndAngle,
        )
        return sliceIndex >= 0 ? sliceIndex : 0
    }

    function trackRotation() {
        if (!spinWheel.value || !isSpinning.value) return

        const transform = getComputedStyle(spinWheel.value).transform
        if (transform && transform !== 'none') {
            // Extract rotation from transform matrix
            const matrix = new DOMMatrix(transform)
            const rotation = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI)
            currDeg.value = rotation

            // Update selected index based on current rotation
            const currentSlice = getCurrentSliceIndex(rotation)
            if (currentSlice !== selectedIndex.value) {
                selectedIndex.value = currentSlice
            }
        }

        // Continue tracking if still spinning
        if (isSpinning.value) {
            animationFrame.value = requestAnimationFrame(trackRotation)
        }
    }

    function spin() {
        if (!spinContainer.value || !spinWheel.value) return
        if (isSpinning.value) return

        isSpinning.value = true

        const chosenAudio = new Audio(
            spinningAudio[Math.floor(Math.random() * spinningAudio.length)],
        )
        chosenAudio.play()

        trackRotation()

        const spinTimeInSeconds = spinTime / 1000
        const intensityConfig = {
            gentle: { speed: 300, variation: 0.2 },
            normal: { speed: 450, variation: 0.3 },
            intense: { speed: 600, variation: 0.4 },
        }

        const config = intensityConfig[spinIntensity.value]
        const baseRotation = config.speed * spinTimeInSeconds

        const variation = (Math.random() - 0.5) * 2 * config.variation * baseRotation
        const totalRotation = baseRotation + variation

        const minRotations =
            spinIntensity.value === 'gentle'
                ? 3 * 360
                : spinIntensity.value === 'normal'
                  ? 4 * 360
                  : 5 * 360

        const finalRotation = Math.max(totalRotation, minRotations)

        const normalizedCurrentDeg = ((currDeg.value % 360) + 360) % 360
        const newDeg = normalizedCurrentDeg + finalRotation

        console.log(
            `${spinIntensity.value} spin: ${finalRotation.toFixed(0)}° over ${spinTimeInSeconds}s`,
        )

        spinWheel.value.style.transform = `rotate(${newDeg}deg)`
        currDeg.value = newDeg

        setTimeout(() => {
            if (animationFrame.value) {
                cancelAnimationFrame(animationFrame.value)
            }

            const normalizedDeg = newDeg % 360
            const winning = spinnerMovieSegments.value.findIndex(
                (entry) =>
                    (360 - normalizedDeg) % 360 >= entry.sliceStartAngle &&
                    (360 - normalizedDeg) % 360 < entry.sliceEndAngle,
            )
            selectedIndex.value = winning
            burstConfetti()

            isSpinning.value = false
            chosenAudio.pause()

            const selectedAudioClip = new Audio(
                selectedAudio[Math.floor(Math.random() * selectedAudio.length)],
            )
            selectedAudioClip.play()
        }, spinTime)
    }

    function getSliceFilter(index: number): string {
        if (isSpinning.value && selectedIndex.value === index) {
            return 'brightness(1.6) saturate(1.5) contrast(1.2) drop-shadow(0 0 15px rgba(255, 215, 0, 0.9))'
        } else if (selectedIndex.value === index) {
            return 'brightness(1.5) saturate(1.4) contrast(1.1) drop-shadow(0 0 12px rgba(169, 79, 202, 0.8))'
        } else if (hoveredIndex.value === index) {
            return 'brightness(1.3) saturate(1.2) contrast(1.05) drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
        }
        return 'brightness(1) saturate(1) contrast(1)'
    }

    function getSliceTransform(index: number): string {
        return 'scale(1) translateZ(0)'
    }

    function selectSlice(index: number) {
        selectedIndex.value = index
    }

    return {
        size,
        spinTime,
        selectedIndex,
        spinContainer,
        spinWheel,
        currDeg,
        watchedMovies,
        isSpinning,
        moviesByPerson,
        numPeople,
        people,
        allMovies: spinnerMovieSegments,
        burstConfetti,
        spin,
        getSliceFilter,
        getSliceTransform,
        hoveredIndex,
        getPersonColour,
        getPersonLabelX,
        getPersonLabelY,
        getPersonLabelRotation,
        selectSlice,
    }
}
