<main>
    <h1>مسجل صوت</h1>
    <AudioRecorder {fetchRecordings} />
    <RecordingsList {recordings} {fetchRecordings} />
</main>

<script lang="ts">
import AudioRecorder from './components/AudioRecorder.svelte'
import RecordingsList from './components/RecordingsList.svelte'
import {getAllRecordings} from './lib/StorageService.ts'

type Recording = {
    id: string
    blob: Blob
    duration: number
    timestamp: number
}

let recordings: Recording[] = []

const fetchRecordings = async () => {
    recordings = await getAllRecordings()
}

fetchRecordings()
</script>
