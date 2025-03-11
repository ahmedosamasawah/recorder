<main class="app-container">
    <h1 class="app-title">مسجل صوت</h1>

    <RecordButtons {isRecording} on:recordingStateChange={handleRecordingStateChange} />
    <AudioPlayer {recording} {isRecording} />
    <RecordingsList />
</main>

<script lang="ts">
import {onMount} from 'svelte'

import AudioPlayer from './components/AudioPlayer.svelte'
import RecordButtons from './components/RecordButtons.svelte'
import RecordingsList from './components/RecordingsList.svelte'
import {recordingProgress} from './lib/stores/audioStore.ts'
import {currentRecording, loadRecordings} from './lib/stores/recordingStore.ts'
import type {Recording} from './lib/types'

let isRecording: boolean = false
let recording: Recording | null = null

// Subscribe to the current recording store
const unsubscribeRecording = currentRecording.subscribe(value => (recording = value))

// Subscribe to recording progress store to ensure isRecording is synced
const unsubscribeProgress = recordingProgress.subscribe(state => (isRecording = state.isActive))

type RecordingStateEvent = {
    detail: {
        isRecording: boolean
    }
}

function handleRecordingStateChange(event: RecordingStateEvent) {
    isRecording = event.detail.isRecording
}

// Initialize recordings
onMount(async () => await loadRecordings())

onDestroy(() => {
    unsubscribeRecording()
    unsubscribeProgress()
})

// Clean up subscription on component destroy
// function cleanup() {
//     unsubscribe()
// }
</script>

<style global>
@font-face {
    font-family: 'Kitab';
    src: url('https://fonts.nuqayah.com/kitab.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Kitab';
    src: url('https://fonts.nuqayah.com/kitab-b.woff2') format('woff2');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
}

:root {
    direction: rtl;
}

* {
    box-sizing: border-box;
}

.app-container {
    max-width: 48rem;
    margin: 0 auto;
    padding: 1.5rem;
    min-height: 100vh;
}

.app-title {
    font-size: 2rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 2rem;
    color: #1f2937;
}

:focus:not(:focus-visible) {
    outline: none;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
    .app-title {
        color: #f3f4f6;
    }
}
</style>
