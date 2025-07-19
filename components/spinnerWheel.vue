<template>
    <div :class="$style.moviesContainer">
        <div :class="$style.wheelContainer">
            <div :class="[$style.spinner, { [$style.isSpinning]: isSpinning }]" ref="spinContainer">
                <svg
                    :class="$style.winningIndicator"
                    :width="40"
                    :height="30"
                    style="
                        position: absolute;
                        left: 50%;
                        top: -18px;
                        transform: translateX(-50%) rotate(180deg);
                        z-index: 2;
                    "
                    viewBox="0 0 40 30"
                >
                    <polygon
                        points="20,0 0,30 40,30"
                        fill="#fff"
                        stroke="#232526"
                        stroke-width="2"
                        opacity="0.85"
                    />
                </svg>
                <div :class="$style.spinnerLever">
                    <button
                        :class="$style.spinnerLeverButton"
                        id="spin"
                        type="button"
                        @click="spin"
                    >
                        Pull the lever to spin the wheel
                    </button>
                </div>
                <svg
                    ref="spinWheel"
                    :class="$style.spinnerSVG"
                    :width="size"
                    :height="size"
                    :viewBox="`0 0 ${size} ${size}`"
                    :style="{
                        transition: `transform ${spinTime}ms cubic-bezier(0.33,1,0.68,1)`,
                    }"
                >
                    <defs>
                        <pattern
                            v-for="(entry, i) in allMovies"
                            :id="`poster-pattern-${i}`"
                            patternUnits="objectBoundingBox"
                            :width="1"
                            :height="1"
                            :key="entry.movie.title"
                        >
                            <image
                                v-if="entry.movie.posterURL"
                                :href="entry.movie.posterURL"
                                :width="size"
                                :height="size"
                                preserveAspectRatio="xMidYMid slice"
                            />
                        </pattern>
                    </defs>
                    <g v-for="(entry, i) in allMovies" :key="entry.movie.title + '-' + i">
                        <path
                            :d="
                                describeArc(
                                    size / 2,
                                    size / 2,
                                    size / 2 - 4,
                                    entry.sliceStartAngle,
                                    entry.sliceEndAngle,
                                )
                            "
                            :fill="
                                entry.movie.posterURL
                                    ? `url(#poster-pattern-${i})`
                                    : colours[i % colours.length]
                            "
                            stroke="#232526"
                            stroke-width="2"
                        />
                        <foreignObject
                            :x="getTextX(entry.sliceStartAngle, entry.sliceEndAngle, size) - 40"
                            :y="getTextY(entry.sliceStartAngle, entry.sliceEndAngle, size) - 20"
                            width="80"
                            height="40"
                        >
                            <div
                                xmlns="http://www.w3.org/1999/xhtml"
                                style="
                                    color: #fff;
                                    font-size: 12px;
                                    text-align: center;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    width: 80px;
                                    height: 40px;
                                    line-height: 1.1;
                                    word-break: break-word;
                                    background: rgba(0, 0, 0, 0.5);
                                    border-radius: 6px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                "
                            >
                                {{ entry.movie.title }}
                            </div>
                        </foreignObject>
                    </g>
                    <!-- Highlight the selected slice on top -->
                    <g v-if="selectedIndex !== null">
                        <path
                            :d="
                                describeArc(
                                    size / 2,
                                    size / 2,
                                    size / 2 - 4,
                                    allMovies[selectedIndex]?.sliceStartAngle ?? 0,
                                    allMovies[selectedIndex]?.sliceEndAngle ?? 0,
                                )
                            "
                            fill="none"
                            stroke="red"
                            stroke-width="6"
                            style="pointer-events: none"
                        />
                    </g>
                </svg>
            </div>
        </div>
        <div :class="$style.metadata">
            <h1>Stuff</h1>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { confetti } from '@tsparticles/confetti'
import { ref, computed } from 'vue'
import type { BadMovie } from '~/shared/types/movie'

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
const randomPicksObj = computed(
    () => badMoviesResponse.value?.randomPicks || ({} as Record<string, BadMovie[]>),
)
const people = computed(() => Object.keys(randomPicksObj.value))
const moviesByPerson = computed(() =>
    people.value.map((person) => randomPicksObj.value[person] || []),
)
const numPeople = computed(() => people.value.length)
const allMovies = computed(() => {
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
                            src: confettiImages[Math.floor(Math.random() * confettiImages.length)],
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
        const winning = allMovies.value.findIndex(
            (entry) =>
                (360 - normalizedDeg) % 360 >= entry.sliceStartAngle &&
                (360 - normalizedDeg) % 360 < entry.sliceEndAngle,
        )
        selectedIndex.value = winning
        burstConfetti()

        isSpinning.value = false
    }, spinTime)
}
</script>

<style lang="scss" module src="~/public/assets/styles/components/spinnerWheel.module.scss"></style>
