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
            <details :class="$style.section">
                <summary>
                    <strong>All Movies</strong>
                </summary>

                <div
                    v-for="(movies, index) in moviesByPerson"
                    :key="index"
                    :class="$style.personSection"
                >
                    <h2 :class="$style.personName">{{ movies[0].suggestedBy }}</h2>

                    <div :class="$style.moviesGrid">
                        <div v-for="movie in movies" :key="movie.title" :class="$style.movieCard">
                            <div :class="$style.moviePoster">
                                <img
                                    v-if="movie.posterURL"
                                    :src="movie.posterURL"
                                    :alt="movie.title"
                                />
                                <div v-else :class="$style.noPoster">No Poster</div>
                            </div>
                            <div :class="$style.movieTitle">{{ movie.title }}</div>
                            <div v-if="movie.year" :class="$style.movieYear">{{ movie.year }}</div>
                        </div>
                    </div>
                </div>
            </details>
        </div>
    </div>
</template>

<script lang="ts" setup>
const {
    size,
    spinTime,
    moviesByPerson,
    selectedIndex,
    spinContainer,
    spinWheel,
    isSpinning,
    allMovies,
    colours,
    spin,
} = await useSpinnerWheel()
</script>

<style lang="scss" module src="~/public/assets/styles/components/spinnerWheel.module.scss"></style>
