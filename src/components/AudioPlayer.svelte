<div
    class="mb-6 rounded-lg bg-white p-4 shadow-sm"
    class:opacity-50={!recording}
    class:hidden={is_recording}
>
    {#if recording && !is_recording}
        <div class="mb-3 flex items-center justify-between">
            <button
                class="p-2 text-gray-600 hover:text-gray-800"
                title="تنزيل التسجيل"
                onclick={() => download_recording(recording)}
            >
                <div class="h-5 w-5">{@html DownloadIcon}</div>
            </button>
            <div class="line-clamp-1 font-medium">{recording.name}</div>
            <button
                aria-pressed={repeat}
                onclick={toggle_repeat}
                aria-label="Toggle repeat"
                class:text-blue-600={repeat}
                class="h-8 w-8 hover:text-gray-800"
            >
                <div class="h-5 w-5">{@html RepeatIcon}</div>
            </button>
        </div>

        <div class="mb-3" dir="ltr">
            <ProgressBar
                height="8px"
                rounded={true}
                max={duration}
                interactive={true}
                value={current_time}
                on_seek={handle_seek}
            />
        </div>

        <div class="mb-4 flex items-center justify-between">
            <TimeDisplay {current_time} {duration} show_remaining={false} />

            <div class="flex gap-3">
                <button
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                    onclick={toggle_play}
                    aria-label={is_playing ? 'Pause' : 'Play'}
                >
                    <div class="h-6 w-6">{@html is_playing ? PauseIcon : PlayIcon}</div>
                </button>
            </div>

            <div class="text-sm text-gray-600">
                <TimeDisplay
                    duration={0}
                    show_remaining={true}
                    current_time={duration - current_time < 1 ? 0 : duration - current_time}
                />
            </div>
        </div>

        <div class="flex items-center justify-between gap-2 max-[400px]:flex-col-reverse">
            <div class="flex items-center gap-2">
                <button
                    class="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200"
                    aria-label="Increase playback speed"
                    onclick={() => change_playback_rate(0.1)}
                >
                    <div class="h-4 w-4">{@html ChevronRightIcon}</div>
                </button>

                <div class="min-w-12 rounded bg-gray-100 px-2 py-1 text-center text-sm">
                    {playback_rate.toFixed(1)}x
                </div>

                <button
                    class="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200"
                    aria-label="Decrease playback speed"
                    onclick={() => change_playback_rate(-0.1)}
                >
                    <div class="h-4 w-4">{@html ChevronLeftIcon}</div>
                </button>
            </div>

            <div class="flex gap-2">
                <button
                    class="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200"
                    onclick={() => skip(5)}
                    aria-label="Skip forward 5 seconds"
                >
                    <div class="h-4 w-4">{@html SkipForwardIcon}</div>
                    <span class="text-sm">5</span>
                </button>
                <button
                    class="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200"
                    onclick={() => skip(-5)}
                    aria-label="Skip backward 5 seconds"
                >
                    <span class="text-sm">5</span>
                    <div class="h-4 w-4">{@html SkipBackwardIcon}</div>
                </button>
            </div>
        </div>
    {:else}
        <div class="flex h-40 items-center justify-center text-gray-500">
            <p>لا يوجد تسجيل مختار</p>
        </div>
    {/if}
</div>

<script>
import {onDestroy, onMount} from 'svelte'

import {
    PlayIcon,
    PauseIcon,
    RepeatIcon,
    DownloadIcon,
    ChevronLeftIcon,
    SkipForwardIcon,
    SkipBackwardIcon,
    ChevronRightIcon,
} from '../lib/utils/icons.js'
import ProgressBar from './ui/ProgressBar.svelte'
import TimeDisplay from './ui/TimeDisplay.svelte'
import {playback_state} from '../lib/stores/audioStore.js'
import {download_recording} from '../lib/stores/recordingStore.js'

let audio
let duration = $state(0)
let repeat = $state(false)
let current_time = $state(0)
let is_playing = $state(false)
let playback_rate = $state(1.0)
let load_promise = $state(null)
let {is_recording, recording} = $props()

$effect(() => {
    if (recording) load_audio(recording)
})

$effect(() => {
    if (is_recording && is_playing && audio) {
        audio.pause()
        is_playing = false
    }
})

async function load_audio(rec) {
    if (!audio) return

    // Reset state
    audio.pause()
    is_playing = false
    current_time = 0

    console.log('Loading audio with duration:', rec.duration)
    // Set duration from recording
    duration = rec.duration || 0

    // Create a load promise
    load_promise = new Promise(resolve => {
        // Setup listener for loaded metadata
        const handle_loaded = () => {
            if (audio.duration && audio.duration !== Infinity) {
                duration = audio.duration
                console.log('Audio metadata loaded. Duration:', duration)
            }

            audio.removeEventListener('loadedmetadata', handle_loaded)
            resolve()
        }

        audio.addEventListener('loadedmetadata', handle_loaded)

        // Set fallback timeout if metadata loading fails
        setTimeout(() => {
            if (load_promise) {
                console.log('Metadata loading timed out. Using recording duration:', rec.duration)
                duration = rec.duration || 0
                resolve()
            }
        }, 2000)
    })

    // Load new audio
    audio.src = rec.url
    audio.playbackRate = playback_rate
    audio.load()
}

async function toggle_play() {
    if (!recording || !audio || is_recording) return

    if (audio.paused && load_promise) {
        try {
            await load_promise
        } catch (error) {
            console.error('Error loading audio:', error)
        }
    }

    if (audio.paused) {
        try {
            await audio.play()
        } catch (error) {
            console.error('Error playing audio:', error)

            if (recording) {
                audio = new Audio(recording.url)
                setup_audio_listeners()
                await audio.play()
                is_playing = true
            }
        }
    } else audio.pause()
}

function toggle_repeat() {
    repeat = !repeat
    if (audio) audio.loop = repeat
}

// In AudioPlayer.svelte
function skip(seconds) {
    if (!recording || !audio || is_recording) return

    // Make sure all values are valid numbers
    const current = audio.currentTime || 0
    const max_duration = isFinite(duration) ? duration : 0

    // Calculate new time with safety bounds
    const new_time = Math.max(0, Math.min(current + seconds, max_duration))

    // Only set if it's a valid number
    if (isFinite(new_time)) audio.currentTime = new_time
}

function handle_seek(percentage) {
    if (!recording || !audio || is_recording) return

    const max_duration = isFinite(duration) ? duration : 0
    const new_time = percentage * max_duration

    if (isFinite(new_time)) audio.currentTime = new_time
}

function change_playback_rate(change) {
    playback_rate = Math.max(0.5, Math.min(2, playback_rate + change))
    if (audio) audio.playbackRate = playback_rate
}

function handle_play() {
    is_playing = true
}

function handle_pause() {
    is_playing = false
}

function handle_time_update() {
    current_time = audio.currentTime

    playback_state.update(state => ({
        ...state,
        current_time,
        duration,
    }))
}

function handle_loaded_metadata() {
    if (audio.duration && audio.duration !== Infinity) {
        duration = audio.duration

        playback_state.update(state => ({
            ...state,
            duration,
        }))
    }
}

function handle_ended() {
    if (repeat) {
        audio.currentTime = 0
        audio.play()
    } else is_playing = false
}

function setup_audio_listeners() {
    if (!audio) return

    audio.addEventListener('play', handle_play)
    audio.addEventListener('pause', handle_pause)
    audio.addEventListener('timeupdate', handle_time_update)
    audio.addEventListener('loadedmetadata', handle_loaded_metadata)
    audio.addEventListener('ended', handle_ended)
}

function cleanup_audio_listeners() {
    if (!audio) return

    audio.pause()
    audio.removeEventListener('play', handle_play)
    audio.removeEventListener('pause', handle_pause)
    audio.removeEventListener('timeupdate', handle_time_update)
    audio.removeEventListener('loadedmetadata', handle_loaded_metadata)
    audio.removeEventListener('ended', handle_ended)
}

onMount(() => {
    audio = new Audio()
    setup_audio_listeners()

    if (recording && !is_recording) load_audio(recording)

    playback_state.set({
        is_playing: false,
        current_time: 0,
        duration: recording?.duration || 0,
        playback_rate,
        repeat,
    })
})

onDestroy(() => {
    if (audio) cleanup_audio_listeners()
})

$effect(() => {
    playback_state.update(state => ({
        ...state,
        is_playing,
        current_time,
        duration,
        playback_rate,
        repeat,
    }))
})
</script>
