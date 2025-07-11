<template>
    <div class="moviesContainer">
        <div class="wheelContainer">
            <div id="main">
                <div class="spinner" id="spinContainer" ref="spinContainer">
                    <div class="spinner-lever">
                        <button class="spinner-lever-button" id="spin" type="button" @click="spin">
                            Pull the lever to spin the wheel
                        </button>
                    </div>
                    <svg
                        ref="spinWheel"
                        class="spinner-svg"
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
                                        getMovieAngles(i, anglePerMovie).startAngle,
                                        getMovieAngles(i, anglePerMovie).endAngle,
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
                                :x="getTextX(getMovieAngles(i, anglePerMovie), size) - 40"
                                :y="getTextY(getMovieAngles(i, anglePerMovie), size) - 20"
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
                    </svg>
                </div>
            </div>
        </div>
        <div class="metadata"></div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { BadMovie } from '~/shared/types/movie'
import { getMovieAngles, describeArc, getTextX, getTextY } from '~/utils/spinnerMath'

const spinContainer = ref<HTMLElement | null>(null)
const spinWheel = ref<SVGSVGElement | null>(null)
const currDeg = ref(0)

const badMoviesFetch = await useFetch('/api/sheets', {
    method: 'GET',
    query: { oneMoviePerPerson: false },
    headers: { 'Content-Type': 'application/json' },
})
const badMoviesResponse = badMoviesFetch.data

// --- Prepare data for subdivided spinner ---
const randomPicksObj = computed(() => badMoviesResponse.value?.randomPicks || {})
const people = computed(() => Object.keys(randomPicksObj.value))
const moviesByPerson = computed(() =>
    people.value.map((person) => randomPicksObj.value[person] || []),
)
const totalMovies = computed(() => moviesByPerson.value.reduce((sum, arr) => sum + arr.length, 0))

const allMovies = computed(() => {
    const arr: { movie: BadMovie; person: string; globalIndex: number; personIndex: number }[] = []
    let globalIndex = 0
    for (let p = 0; p < people.value.length; p++) {
        for (let m = 0; m < moviesByPerson.value[p].length; m++) {
            arr.push({
                movie: moviesByPerson.value[p][m],
                person: people.value[p],
                globalIndex,
                personIndex: m,
            })
            globalIndex++
        }
    }
    return arr
})

// TODO: Get rid of colours since we just use posters now
const colours = ['#a94fca']

const size = 400
const spinTime = 3000

const anglePerMovie = computed(() => (totalMovies.value > 0 ? 360 / totalMovies.value : 360))

function spin() {
    if (!spinContainer.value || !spinWheel.value) return
    const startingDeg = currDeg.value
    const randDeg = startingDeg + Math.round(Math.random() * (3000 - 360) + 360)
    spinContainer.value.classList.add('is-spinning')
    spinWheel.value.style.transform = `rotate(${randDeg}deg)`
    currDeg.value = randDeg
    setTimeout(() => {
        spinContainer.value?.classList.remove('is-spinning')
    }, spinTime)
}
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');

* {
    margin: 0;
    padding: 0;
    background: transparent;
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
}

@at-root {
    @keyframes movePole {
        0%,
        100% {
            transform: translateZ(0) translateY(-25%);
            height: 35%;
        }
        5%,
        50% {
            height: 10%;
        }
        10% {
            transform: translateZ(0) translateY(50%);
            height: 35%;
        }
        15% {
            height: 35%;
        }
    }
}

@at-root {
    @keyframes moveLever {
        0%,
        100% {
            transform: translateY(0%);
        }
        10% {
            transform: translateY(240%);
        }
    }
}

.moviesContainer {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    min-height: 100vh;
    gap: 2em;

    .metadata {
        margin-top: 1em;
        color: #fff;
        font-size: 0.9em;
        min-width: 20em;
        min-height: 20em;
        text-align: center;
        border: 1px solid green;
    }

    .wheelContainer {
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        .spinner {
            &.is-spinning {
                .spinner-lever:after {
                    animation: movePole 3000ms ease-in-out;
                }
                .spinner-lever-button {
                    animation: moveLever 3000ms ease-in-out;
                }
            }
            --spin-time: 3000;
            position: relative;
            width: 400px;
            height: 400px;
            margin: 2rem auto;
            .spinner-svg {
                display: block;
                margin: 0 auto;
                width: 100%;
                height: auto;
                max-width: 400px;
                max-height: 400px;
                border-radius: 50%;
                background: #232526;
                box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
            }
        }
        .spinner-lever {
            position: absolute;
            top: 0;
            bottom: 0;
            margin: auto;
            left: calc(100% + 0.4vw);
            border: 0.1vw solid grey;
            background-color: lightgrey;
            width: 4vw;
            height: 8.5vw;
            &:before,
            &:after {
                content: '';
                display: block;
                position: absolute;
                left: 0;
                right: 0;
                margin: auto;
            }
            &:before {
                top: 0;
                bottom: 0;
                background-color: grey;
                height: 80%;
                width: 1.2vw;
            }
            &:after {
                top: 0;
                bottom: 0;
                margin: auto;
                height: 35%;
                width: 0.8vw;
                background-color: lightgrey;
                transform: translateZ(0) translateY(-25%);
                backface-visibility: hidden;
            }
            &-button {
                text-indent: -9999px;
                position: absolute;
                border: 0;
                background: transparent;
                padding: 0;
                width: 1.8vw;
                height: 1.8vw;
                background-color: red;
                border-radius: 100%;
                cursor: pointer;
                top: calc(25% - #{1.8 / 2 * 1vw});
                left: 0;
                right: 0;
                margin: auto;
                z-index: 1;
            }
        }
    }
}

@media (max-width: 900px) {
    .moviesContainer {
        flex-direction: column;
        align-items: center;
        gap: 1em;
        .wheelContainer {
            width: 100vw;
            height: 100vw;
        }
        .metadata {
            max-width: 100vw;
            width: 100%;
        }
    }
}
</style>
