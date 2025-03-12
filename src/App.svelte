<main class="mx-auto min-h-screen max-w-3xl p-6">
    <h1 class="mb-8 text-center text-2xl font-bold text-gray-800">مسجل صوت</h1>

    <RecordButtons {is_recording} on:recordingStateChange={handle_recording_state_change} />
    {#if recording}
        <AudioPlayer {recording} {is_recording} />
    {/if}
    <RecordingsList />
</main>

<script>
import {onMount, onDestroy} from 'svelte'
import AudioPlayer from './components/AudioPlayer.svelte'
import RecordButtons from './components/RecordButtons.svelte'
import RecordingsList from './components/RecordingsList.svelte'
import {recording_progress} from './lib/stores/audioStore.js'
import {current_recording, load_recordings} from './lib/stores/recordingStore.js'

// Define state variables
let recording = $state(null)
let is_recording = $state(false)

// Subscribe to the current recording store
const unsubscribe_recording = current_recording.subscribe(value => (recording = value))

// Subscribe to recording progress store to ensure is_recording is synced
const unsubscribe_progress = recording_progress.subscribe(state => (is_recording = state.is_active))

function handle_recording_state_change(event) {
    is_recording = event.detail.is_recording
}

// Initialize recordings
onMount(async () => await load_recordings())

onDestroy(() => {
    unsubscribe_recording()
    unsubscribe_progress()
})
</script>
