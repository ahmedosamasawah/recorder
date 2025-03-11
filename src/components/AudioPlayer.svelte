<div class="audio-player {!recording ? 'disabled' : ''} {isRecording ? 'hidden' : ''}">
    {#if recording && !isRecording}
        <div class="player-header">
            <Button
                type="icon"
                size="small"
                styles={'p-0'}
                icon={DownloadIcon}
                title="تنزيل التسجيل"
                on:click={() => downloadRecording(recording)}
            />
            <div class="recording-name">{recording.name}</div>
            <div class="spacer"></div>
        </div>

        <div class="progress-container" dir="ltr">
            <ProgressBar
                height="8px"
                rounded={true}
                max={duration}
                interactive={true}
                value={currentTime}
                onSeek={handleSeek}
            />
        </div>

        <div class="time-container">
            <TimeDisplay {currentTime} {duration} showRemaining={false} />
            <div class="main-controls">
                <button
                    class="repeat-button"
                    class:active={repeat}
                    aria-pressed={repeat}
                    on:click={toggleRepeat}
                    aria-label="Toggle repeat"
                >
                    <Icon icon={RepeatIcon} size="1.5em" />
                </button>

                <button
                    class="play-button"
                    on:click={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    <Icon icon={isPlaying ? PauseIcon : PlayIcon} size="1.5em" />
                </button>
            </div>

            <div class="remaining-time">
                <TimeDisplay
                    duration={0}
                    showRemaining={true}
                    currentTime={duration - currentTime < 1 ? 0 : duration - currentTime}
                />
            </div>
        </div>

        <div class="additional-controls">
            <div class="playback-rate-controls">
                <button
                    class="speed-button"
                    aria-label="Increase playback speed"
                    on:click={() => changePlaybackRate(0.1)}
                >
                    <Icon icon={ChevronRightIcon} size="1em" />
                </button>

                <div class="playback-rate-display">
                    {playbackRate.toFixed(1)}x
                </div>

                <button
                    class="speed-button"
                    aria-label="Decrease playback speed"
                    on:click={() => changePlaybackRate(-0.1)}
                >
                    <Icon icon={ChevronLeftIcon} size="1em" />
                </button>
            </div>

            <div class="skip-controls">
                <button
                    class="skip-button"
                    on:click={() => skip(5)}
                    aria-label="Skip forward 5 seconds"
                >
                    <Icon icon={SkipForwardIcon} size="1em" />
                    <span>5</span>
                </button>

                <button
                    class="skip-button"
                    on:click={() => skip(-5)}
                    aria-label="Skip backward 5 seconds"
                >
                    <span>5</span>
                    <Icon icon={SkipBackwardIcon} size="1em" />
                </button>
            </div>
        </div>
    {:else}
        <div class="no-recording">
            <p>لا يوجد تسجيل مختار</p>
        </div>
    {/if}
</div>

<script lang="ts">
import {onDestroy, onMount} from 'svelte'

import {playbackState} from '../lib/stores/audioStore.ts'
import {downloadRecording} from '../lib/stores/recordingStore.ts'
import type {Recording} from '../lib/types'
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    DownloadIcon,
    PauseIcon,
    PlayIcon,
    RepeatIcon,
    SkipBackwardIcon,
    SkipForwardIcon,
} from '../lib/utils/icons.ts'
import Button from './ui/Button.svelte'
import Icon from './ui/Icon.svelte'
import ProgressBar from './ui/ProgressBar.svelte'
import TimeDisplay from './ui/TimeDisplay.svelte'

export let isRecording: boolean
export let recording: Recording | null = null

let duration = 0
let repeat = false
let currentTime = 0
let isPlaying = false
let playbackRate = 1.0
let audio: HTMLAudioElement
let loadPromise: Promise<void> | null = null

$: if (recording) loadAudio(recording)

$: if (isRecording && isPlaying)
    if (audio) {
        audio.pause()
        isPlaying = false
    }

async function loadAudio(rec: Recording) {
    if (!audio) return

    // Reset state
    audio.pause()
    isPlaying = false
    currentTime = 0

    // Create a load promise
    loadPromise = new Promise(resolve => {
        // Setup listener for loaded metadata
        const handleLoaded = () => {
            if (audio.duration && audio.duration !== Infinity) duration = audio.duration
            else duration = rec.duration

            audio.removeEventListener('loadedmetadata', handleLoaded)
            resolve()
        }

        audio.addEventListener('loadedmetadata', handleLoaded)

        // Set fallback timeout if metadata loading fails
        setTimeout(() => {
            if (loadPromise) {
                duration = rec.duration
                resolve()
            }
        }, 2000)
    })

    // Load new audio
    audio.src = rec.url
    audio.playbackRate = playbackRate
    audio.load()
}

async function togglePlay() {
    if (!recording || !audio || isRecording) return

    if (audio.paused && loadPromise) {
        try {
            await loadPromise
        } catch (error) {
            console.error('Error loading audio:', error)
        }
    }

    if (audio.paused) {
        try {
            await audio.play()
        } catch (error) {
            console.error('Error playing audio:', error) // TODO: Delete later

            if (recording) {
                audio = new Audio(recording.url)
                setupAudioListeners()
                await audio.play()
                isPlaying = true
            }
        }
    } else {
        audio.pause()
    }
}

function toggleRepeat() {
    repeat = !repeat
    if (audio) audio.loop = repeat
}

function skip(seconds: number) {
    if (!recording || !audio || isRecording) return
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration))
}

function handleSeek(percentage: number) {
    if (!recording || !audio || isRecording) return
    audio.currentTime = percentage * duration
}

function changePlaybackRate(change: number) {
    playbackRate = Math.max(0.5, Math.min(2, playbackRate + change))
    if (audio) audio.playbackRate = playbackRate
}

function handlePlay() {
    isPlaying = true
}

function handlePause() {
    isPlaying = false
}

function handleTimeUpdate() {
    currentTime = audio.currentTime

    playbackState.update(state => ({
        ...state,
        currentTime,
        duration,
    }))
}

function handleLoadedMetadata() {
    if (audio.duration && audio.duration !== Infinity) {
        duration = audio.duration

        playbackState.update(state => ({
            ...state,
            duration,
        }))
    }
}

function handleEnded() {
    if (repeat) {
        audio.currentTime = 0
        audio.play()
    } else isPlaying = false
}

function setupAudioListeners() {
    if (!audio) return

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
}

function cleanupAudioListeners() {
    if (!audio) return

    audio.pause()
    audio.removeEventListener('play', handlePlay)
    audio.removeEventListener('pause', handlePause)
    audio.removeEventListener('timeupdate', handleTimeUpdate)
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
    audio.removeEventListener('ended', handleEnded)
}

onMount(() => {
    audio = new Audio()
    setupAudioListeners()

    if (recording && !isRecording) loadAudio(recording)

    playbackState.set({
        isPlaying: false,
        currentTime: 0,
        duration: recording?.duration || 0,
        playbackRate,
        repeat,
    })
})

onDestroy(() => {
    if (audio) cleanupAudioListeners()
})

$: playbackState.update(state => ({
    ...state,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    repeat,
}))
</script>

<style>
.audio-player {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.player-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.recording-name {
    font-size: 1.125rem;
    font-weight: 500;
    text-align: center;
}

.spacer {
    width: 1.5rem;
}

.progress-container {
    margin-bottom: 0.75rem;
}

.time-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

@media (max-width: 400px) {
    .time-container {
        flex-direction: columns;
    }
}

.main-controls {
    display: flex;
    gap: 0.75rem;
}

.play-button {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background-color: #4a86e8;
    color: white;
    cursor: pointer;
    transition: background-color 0.2s;
}

.play-button:hover {
    background-color: #3a76d8;
}

.repeat-button {
    border: none;
    color: #000;
    width: 3.5rem;
    display: flex;
    height: 3.5rem;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
}

.repeat-button:hover {
    background-color: #e0e0e0;
}

.repeat-button.active {
    color: #4a86e8;
    background-color: #e6f0ff;
}

.additional-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

@media (max-width: 400px) {
    .additional-controls {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .playback-rate-controls,
    .skip-controls {
        width: 100%;
        justify-content: center;
    }
}
.playback-rate-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.speed-button {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background-color: #f5f5f5;
    color: #333;
    cursor: pointer;
}

.speed-button:hover {
    background-color: #e0e0e0;
}

.playback-rate-display {
    font-size: 0.875rem;
    color: #333;
    background-color: #f5f5f5;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    min-width: 3rem;
    text-align: center;
}

.skip-controls {
    display: flex;
    gap: 0.5rem;
}

.skip-button {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.25rem;
    border: none;
    background-color: #f5f5f5;
    color: #333;
    cursor: pointer;
}

.skip-button:hover {
    background-color: #e0e0e0;
}

.no-recording {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 10rem;
    color: #666;
}
</style>
