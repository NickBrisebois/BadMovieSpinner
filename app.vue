<script setup lang="ts">
import Spinner from './components/spinnerWheel.vue'
</script>

<template>
    <header>
        <div class="wrapper">
            <h1>BAD MOVIE SPINNER</h1>
        </div>
    </header>

    <main>
        <NuxtRouteAnnouncer />

        <div class="wrapper">
            <Spinner />
        </div>
    </main>
</template>

<style>
html,
body {
    background: radial-gradient(circle at 50% 30%, #232526 0%, #414345 100%);
    min-height: 100vh;
    margin: 0;
    font-family: 'Poppins', sans-serif;
    color: #fff;
}

header {
    background: linear-gradient(90deg, #db7093 0%, #4169e1 100%);
    padding: 2em 0 1em 0;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.15);
    width: 100vw;
}

header h1 {
    font-size: 2.8em;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #fff;
    text-shadow:
        0 4px 24px rgba(0, 0, 0, 0.25),
        0 1px 0 #333;
    margin: 0;
    padding: 0;
    text-align: center;
}

main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-height: 80vh;
    padding: 2em 0;
}

.wrapper {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
}

@media (max-width: 700px) {
    header h1 {
        font-size: 2em;
    }
    main {
        padding: 1em 0;
    }
}
</style>
