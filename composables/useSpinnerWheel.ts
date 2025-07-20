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
    const isSpinning = ref(false)

    const badMoviesFetch = await useFetch('/api/sheets', {
        method: 'GET',
        query: { oneMoviePerPerson: false },
        headers: { 'Content-Type': 'application/json' },
    })
    const badMoviesResponse = badMoviesFetch.data
    console.log(badMoviesResponse.value)
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

    const colours = ['#a94fca']

    const confettiImages = [
        '/assets/images/confetti.png',
        '/assets/images/confetti2.png',
        '/assets/images/confetti3.png',
        '/assets/images/confetti4.png',
        '/assets/images/confetti5.png',
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

    function spin() {
        if (!spinContainer.value || !spinWheel.value) return

        isSpinning.value = true

        const startingDeg = currDeg.value
        const randDeg = startingDeg + Math.round(Math.random() * (3000 - 360) + 360)
        spinWheel.value.style.transform = `rotate(${randDeg}deg)`
        currDeg.value = randDeg

        setTimeout(() => {
            // Find the winning slice based on the final angle
            const normalizedDeg = randDeg % 360
            // Find which slice contains the 12 o'clock position (0 deg)
            const winning = spinnerMovieSegments.value.findIndex(
                (entry) =>
                    (360 - normalizedDeg) % 360 >= entry.sliceStartAngle &&
                    (360 - normalizedDeg) % 360 < entry.sliceEndAngle,
            )
            selectedIndex.value = winning
            burstConfetti()

            isSpinning.value = false
        }, spinTime)
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
        people,
        moviesByPerson,
        numPeople,
        allMovies: spinnerMovieSegments,
        colours,
        burstConfetti,
        spin,
    }
}
