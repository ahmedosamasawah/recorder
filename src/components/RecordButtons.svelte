<div class="mb-8 flex flex-col items-center">
    <div class="mb-2 flex gap-6">
        {#if is_recording}
            <button
                title="توقف"
                aria-label="توقف"
                disabled={!is_recording}
                onclick={handle_stop_recording}
                class="flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-800 shadow-md hover:bg-gray-50"
            >
                <div class="h-6 w-6">
                    {@html StopIcon}
                </div>
            </button>
        {:else}
            <button
                title="سجل"
                aria-label="سجل"
                disabled={is_recording}
                onclick={handle_start_recording}
                class="flex h-16 w-16 items-center justify-center rounded-full bg-white text-red-500 shadow-md hover:bg-gray-50"
            >
                <div class="h-6 w-6">
                    {@html RecordIcon}
                </div>
            </button>
        {/if}
    </div>

    {#if is_recording}
        <div class="mt-2 flex items-center gap-2">
            <div class="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
            <TimeDisplay current_time={elapsed_time} duration={0} />
        </div>
    {/if}
</div>

<script>
import TimeDisplay from './ui/TimeDisplay.svelte'
import {createEventDispatcher, onDestroy} from 'svelte'
import {RecordIcon, StopIcon} from '../lib/utils/icons.js'
import {save_recording} from '../lib/stores/recordingStore.js'
import {recording_progress} from '../lib/stores/audioStore.js'
import {start_recording, stop_recording} from '../lib/services/AudioService.js'

let elapsed_time = $state(0)
let {is_recording} = $props()
let interval_id = $state(undefined)
const dispatch = createEventDispatcher()

// Subscribe to recording progress store
const unsubscribe = recording_progress.subscribe(state => {
    is_recording = state.is_active
    dispatch('recordingStateChange', {is_recording: state.is_active})
})

$effect(() => {
    if (is_recording && !interval_id) start_timer()
    else if (!is_recording && interval_id) stop_timer()
})

function start_timer() {
    elapsed_time = 0
    interval_id = window.setInterval(() => (elapsed_time += 1), 1000)
}

function stop_timer() {
    if (interval_id) {
        clearInterval(interval_id)
        interval_id = undefined
    }
}

async function handle_start_recording() {
    try {
        await start_recording()
    } catch (error) {
        console.error('Failed to start recording:', error)
        alert('فشل في بدء التسجيل. الرجاء التأكد من إتاحة الوصول إلى الميكروفون.')
    }
}

async function handle_stop_recording() {
    try {
        const result = await stop_recording()

        const audio_blob = result.blob || result
        const duration = result.duration || elapsed_time

        console.log('Saving recording with duration:', duration) // TODO: DELETE LATER
        await save_recording(audio_blob, duration)
        elapsed_time = 0
    } catch (error) {
        console.error('Failed to stop recording:', error)
        alert('حدث خطأ أثناء حفظ التسجيل.')
    }
}

onDestroy(() => {
    unsubscribe()
    stop_timer()
})
</script>
