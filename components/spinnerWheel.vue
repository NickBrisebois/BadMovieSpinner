<template>
    <div class="moviesContainer">
        <div class="wheelContainer">
            <div class="spinBtn">spin</div>
            <div class="wheel">
                <div
                    v-for="(movie, i) in unwatchedBadMovies"
                    :key="movie.title"
                    class="movieItem"
                    :style="{
                        '--i': i,
                        '--angle': 360 / unwatchedBadMovies.length,
                        '--clr': colors[i % colors.length],
                        backgroundImage: movie.posterURL
                            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${movie.posterURL}')`
                            : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }"
                >
                    <span
                        ><a target="_blank" :href="movie.link">{{ movie.title }}</a></span
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import type { BadMovie } from '~/shared/types/movie'

const wheel = ref<HTMLElement | null>(null)
const spinButton = ref<HTMLElement | null>(null)

const unwatchedBadMovies = ref<BadMovie[]>([])
const watchedBadMovies = ref<BadMovie[]>([])
const colors = [
    '#db7093',
    '#20b2aa',
    '#d63e92',
    '#daa520',
    '#ff34f0',
    '#ff7f50',
    '#3cb371',
    '#4169e1',
]

onMounted(async () => {
    const badMoviesResponse = await useFetch('/api/sheets', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    unwatchedBadMovies.value = badMoviesResponse.data.value?.unwatchedMovies || []
    console.log('Bad Movies:', unwatchedBadMovies)

    wheel.value = document.querySelector('.wheel')
    spinButton.value = document.querySelector('.spinBtn')

    if (wheel.value && spinButton.value) {
        spinButton.value.addEventListener('click', () => {
            const randomDegree = Math.floor(Math.random() * 360 + 720)
            wheel.value!.style.transform = `rotate(${randomDegree}deg)`
        })
    }
})
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

.wheelContainer {
    position: relative;
    width: 40em;
    height: 40em;
    display: flex;
    justify-content: center;
    align-items: center;

    .spinBtn {
        position: absolute;
        width: 60px;
        height: 60px;
        background: #fff;
        border-radius: 50%;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;
        text-transform: uppercase;
        font-weight: 100;
        color: #333;
        letter-spacing: 0.1em;
        border: 4px solid rgba(0, 0, 0, 0.75);
        cursor: pointer;
        user-select: none;
    }

    .spinBtn::before {
        content: '';
        position: absolute;
        top: -28px;
        width: 20px;
        height: 30px;
        background: #fff;
        clip-path: polygon(50% 0%, 15% 100%, 85% 100%);
    }

    .wheel {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #333;
        border-radius: 50%;
        overflow: hidden;
        box-shadow:
            0 0 0 5px #333,
            0 0 0 15px #fff,
            0 0 0 18px #111;
        transition: transform 5s ease-in-out;

        .movieItem {
            position: absolute;
            width: 50%;
            height: 50%;
            background: var(--clr);
            transform-origin: bottom right;
            // Use the dynamic angle:
            transform: rotate(calc(var(--angle) * var(--i) * 1deg));
            // Optionally, adjust the clip-path for better segment shape if needed
            clip-path: polygon(0 0, 56% 0, 100% 100%, 0 56%);
            display: flex;
            justify-content: center;
            align-items: center;
            user-select: none;
            cursor: pointer;

            a {
                color: #fff;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }

            span {
                position: relative;
                transform: rotate(calc(var(--angle) * 1deg));
                font-size: 0.75em;
                font-weight: 700;
                color: #fff;
                text-shadow: 3px 5px 2px rgba(0, 0, 0, 0.15);
            }
        }
    }
}
</style>
