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
    margin: 0;
    padding: 0;
    font-family: 'Arial', sans-serif;
    color: #fff;
    height: 100%;
}
body {
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);

    &::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image:
            radial-gradient(circle at 1px 1px, rgba(255, 0, 128, 0.3) 1px, transparent 0),
            radial-gradient(circle at 21px 21px, rgba(0, 255, 255, 0.2) 1px, transparent 0);
        background-size: 40px 40px;
        background-position:
            0 0,
            20px 20px;
        animation: dotMatrix 8s linear infinite;
        pointer-events: none;
        z-index: -1;
    }

    &::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(169, 79, 202, 0.1) 45deg,
            transparent 90deg,
            rgba(255, 107, 157, 0.1) 135deg,
            transparent 180deg,
            rgba(0, 255, 255, 0.1) 225deg,
            transparent 270deg,
            rgba(255, 0, 128, 0.1) 315deg,
            transparent 360deg
        );
        animation: conicSpin 30s linear infinite;
        pointer-events: none;
        z-index: -2;
    }
}

@keyframes dotMatrix {
    0% {
        transform: translate(0, 0);
    }
    100% {
        transform: translate(40px, 40px);
    }
}

@keyframes conicSpin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
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
