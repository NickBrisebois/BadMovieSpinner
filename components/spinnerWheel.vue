<template>
    <div :class="$style.moviesContainer">
        <div :class="[$style.wheelContainer, { [$style.isSpinning]: isSpinning }]">
            <div :class="$style.spinner" ref="spinContainer">
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
                            stroke="rgba(255, 255, 255, 0.2)"
                            stroke-width="1.5"
                            :style="{
                                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                filter: getSliceFilter(i),
                                transform: getSliceTransform(i),
                                transformOrigin: 'center',
                                cursor: 'pointer',
                                '--slice-shadow':
                                    hoveredIndex === i
                                        ? '0 0 15px rgba(255,255,255,0.4)'
                                        : '0 0 5px rgba(0,0,0,0.2)',
                            }"
                            @mouseenter="hoveredIndex = i"
                            @mouseleave="hoveredIndex = null"
                            @click="selectSlice(i)"
                        />
                        <foreignObject
                            :x="getTextX(entry.sliceStartAngle, entry.sliceEndAngle, size) - 40"
                            :y="getTextY(entry.sliceStartAngle, entry.sliceEndAngle, size) - 20"
                            width="80"
                            height="40"
                        >
                            <div
                                :class="[
                                    $style.movieLabel,
                                    { [$style.selectedMovie]: selectedIndex === i },
                                ]"
                            >
                                <a :href="entry.movie.link" target="_blank">{{
                                    entry.movie.title
                                }}</a>
                            </div>
                        </foreignObject>
                    </g>
                </svg>

                <div :class="$style.spinActivator">
                    <button
                        :class="[$style.spinButton, { [$style.loading]: isSpinning }]"
                        id="spin"
                        @click="spin"
                    >
                        <span :class="$style.front"></span>
                    </button>
                </div>
            </div>
        </div>
        <div :class="$style.metadata">
            <div :class="$style.section">
                <div v-if="selectedIndex !== null" :class="$style.selectedMovieInfo">
                    <h2 :class="$style.selectedMovieTitle">
                        {{ allMovies[selectedIndex].movie.title }}
                    </h2>
                    <p :class="$style.selectedMovieDescription">
                        Suggested by: {{ allMovies[selectedIndex].movie.suggestedBy }}
                    </p>
                    <p v-if="allMovies[selectedIndex].movie.year" :class="$style.selectedMovieYear">
                        Year: {{ allMovies[selectedIndex].movie.year }}
                    </p>
                </div>
                <div v-else :class="$style.selectedMovieInfo">
                    <h2 :class="$style.sectionTitle">Spin the Wheel!</h2>
                    <p :class="$style.description">
                        Click the button to spin the wheel and get a random bad movie to watch :)
                    </p>
                </div>
            </div>
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
            <details :class="$style.section">
                <summary>
                    <strong>Watched Movies</strong>
                </summary>

                <div
                    v-for="(movies, person) in watchedMovies"
                    :key="person"
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
    watchedMovies,
    moviesByPerson,
    selectedIndex,
    spinContainer,
    spinWheel,
    isSpinning,
    allMovies,
    colours,
    spin,
    getSliceFilter,
    getSliceTransform,
    hoveredIndex,
    selectSlice,
} = await useSpinnerWheel()
</script>

<style lang="scss" module src="~/public/assets/styles/components/spinnerWheel.module.scss"></style>
