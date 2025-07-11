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
                                v-for="(movie, i) in randomPicks"
                                :id="`poster-pattern-${i}`"
                                patternUnits="objectBoundingBox"
                                :width="1"
                                :height="1"
                                :key="movie.title"
                            >
                                <image
                                    v-if="movie.posterURL"
                                    :href="movie.posterURL"
                                    :width="size"
                                    :height="size"
                                    preserveAspectRatio="xMidYMid slice"
                                />
                            </pattern>
                        </defs>
                        <g v-for="(movie, i) in randomPicks" :key="movie.title">
                            <path
                                :d="
                                    describeArc(
                                        size / 2,
                                        size / 2,
                                        size / 2 - 4,
                                        i * angle,
                                        (i + 1) * angle,
                                    )
                                "
                                :fill="
                                    movie.posterURL
                                        ? `url(#poster-pattern-${i})`
                                        : colors[i % colors.length]
                                "
                                stroke="#232526"
                                stroke-width="2"
                            />
                            <foreignObject
                                :x="getTextX(i) - 40"
                                :y="getTextY(i) - 20"
                                width="80"
                                height="40"
                                :transform="`rotate(${i * angle + angle.value / 2} ${getTextX(i)} ${getTextY(i)})`"
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
                                    {{ movie.title }}
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

const spinContainer = ref<HTMLElement | null>(null)
const spinWheel = ref<SVGSVGElement | null>(null)
const currDeg = ref(0)

const badMoviesFetch = await useFetch('/api/sheets', {
    method: 'GET',
    query: { oneMoviePerPerson: false },
    headers: { 'Content-Type': 'application/json' },
})
const badMoviesResponse = badMoviesFetch.data
const flattenedMovies = Object.values(badMoviesResponse.value?.randomPicks || {}).flat()

const randomPicks = ref<BadMovie[]>(flattenedMovies as BadMovie[])
const colors = [
    '#a94fca',
    '#ee4266',
    '#ffd23f',
    '#3bceac',
    '#2765d4',
    '#ff715b',
    '#a94fca',
    '#ee4266',
    '#ffd23f',
    '#3bceac',
    '#2765d4',
    '#ff715b',
]

const size = 400
const spinTime = 3000

const angle = computed(() => (randomPicks.value.length ? 360 / randomPicks.value.length : 360))

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
        x: cx + r * Math.cos(angleInRadians),
        y: cy + r * Math.sin(angleInRadians),
    }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return [
        'M',
        cx,
        cy,
        'L',
        start.x,
        start.y,
        'A',
        r,
        r,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
        'Z',
    ].join(' ')
}

function getTextX(i: number) {
    const a = (i + 0.5) * angle.value - 90
    return size / 2 + (size / 3.2) * Math.cos((a * Math.PI) / 180)
}
function getTextY(i: number) {
    const a = (i + 0.5) * angle.value - 90
    return size / 2 + (size / 3.2) * Math.sin((a * Math.PI) / 180)
}

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
        #main {
            height: 100vh;
            width: 100vw;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .spinner {
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
                .is-spinning & {
                    animation: movePole 3000ms ease-in-out;
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
                .is-spinning & {
                    animation: moveLever 3000ms ease-in-out;
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
