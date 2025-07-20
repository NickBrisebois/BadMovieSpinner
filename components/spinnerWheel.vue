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
                        <radialGradient
                            v-for="(person, personIndex) in people"
                            :key="`gradient-${person}`"
                            :id="`person-gradient-${personIndex}`"
                        >
                            <stop
                                offset="0%"
                                :stop-color="getPersonColour(person, people)"
                                stop-opacity="1"
                            />
                            <stop
                                offset="100%"
                                :stop-color="getPersonColour(person, people)"
                                stop-opacity="0.8"
                            />
                        </radialGradient>
                    </defs>
                    <g class="person-sections">
                        <g v-for="(person, personIndex) in people" :key="`section-${person}`">
                            <path
                                :d="
                                    describeArc(
                                        size / 2,
                                        size / 2,
                                        size / 2 + 8,
                                        personIndex * (360 / people.length),
                                        (personIndex + 1) * (360 / people.length),
                                    )
                                "
                                :fill="`url(#person-gradient-${personIndex})`"
                                stroke="rgba(0, 0, 0, 0.1)"
                                stroke-width="1"
                            />
                        </g>
                    </g>
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
                                    : getPersonColour(entry.person, people)
                            "
                            :style="{
                                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                filter: getSliceFilter(i),
                                transform: getSliceTransform(i),
                                transformOrigin: 'center',
                                cursor: 'pointer',
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
                    <div :class="$style.selectedMovieHeader">
                        <div :class="$style.selectedMoviePoster">
                            <img
                                v-if="allMovies[selectedIndex].movie.posterURL"
                                :src="allMovies[selectedIndex].movie.posterURL"
                                :alt="allMovies[selectedIndex].movie.title"
                            />
                            <div v-else :class="$style.noPoster">No Poster</div>
                        </div>
                        <div :class="$style.selectedMovieDetails">
                            <h2 :class="$style.selectedMovieTitle">
                                {{ allMovies[selectedIndex].movie.title }}
                            </h2>
                            <p
                                v-if="allMovies[selectedIndex].movie.year"
                                :class="$style.selectedMovieYear"
                            >
                                {{ allMovies[selectedIndex].movie.year }}
                            </p>
                            <p :class="$style.selectedMovieSuggestedBy">
                                Suggested by: {{ allMovies[selectedIndex].movie.suggestedBy }}
                            </p>
                        </div>
                    </div>
                    <div :class="$style.selectedMovieDescription">
                        <p>
                            {{
                                allMovies[selectedIndex].movie.description ||
                                'No description available.'
                            }}
                        </p>
                    </div>
                    <div
                        v-if="allMovies[selectedIndex].movie.link"
                        :class="$style.selectedMovieActions"
                    >
                        <a
                            :href="allMovies[selectedIndex].movie.link"
                            target="_blank"
                            :class="$style.tmdbLinkButton"
                        >
                            🎬 TMDb Details
                        </a>
                    </div>
                </div>
                <div v-else :class="$style.selectedMovieInfo">
                    <h2 :class="$style.sectionTitle">Spin the Wheel!</h2>
                    <p :class="$style.description">
                        Click the button to spin the wheel and get a random bad movie to watch :)
                    </p>
                </div>
            </div>
            <div :class="[$style.personLegend, $style.section]">
                <h3>Movie Suggesters</h3>
                <div :class="$style.legendItems">
                    <div v-for="(person, index) in people" :key="person" :class="$style.legendItem">
                        <div
                            :class="$style.legendColor"
                            :style="{ backgroundColor: getPersonColour(person, people) }"
                        ></div>
                        <span>{{ person }}</span>
                    </div>
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
    getPersonColour,
    spin,
    getSliceFilter,
    getSliceTransform,
    hoveredIndex,
    selectSlice,
    people,
} = await useSpinnerWheel()
</script>

<style lang="scss" module src="~/public/assets/styles/components/spinnerWheel.module.scss"></style>
