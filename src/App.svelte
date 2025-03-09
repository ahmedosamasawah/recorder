<main>
    <h1>مسجل صوت</h1>
    <AudioRecorder />
    <div class="recordings">
        {#each recordings as rec (rec.timestamp)}
            <Player audioBlob={rec.blob} />
        {/each}
    </div>
</main>

<script lang="ts">
import AudioRecorder from './components/AudioRecorder.svelte'
import Player from './components/Player.svelte'
import {getAllRecordings} from './lib/StorageService.ts'

type Recording = {
    blob: Blob
    timestamp: number
}

let recordings: Recording[] = []

const fetchRecordings = async () => {
    recordings = await getAllRecordings()
}

fetchRecordings()
</script>
