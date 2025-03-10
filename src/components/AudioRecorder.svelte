<main>
    <button on:click={isRecording ? handleStop : handleStart}>
        {isRecording ? '⏹ توقف' : '⏺ سجل'}
    </button>

    {#if recordedBlob}
        <div class="playback">
            <audio controls>
                <source src={URL.createObjectURL(recordedBlob)} type="audio/mp4" />
            </audio>
            <button on:click={handleSave}>💾 حفظ</button>
            <button on:click={handleDelete}>❌ مسح</button>
        </div>
    {/if}
</main>

<script lang="ts">
import {startRecording, stopRecording} from '../lib/AudioService.ts'
import {saveRecording} from '../lib/StorageService.ts'

export let fetchRecordings

let intervalId: number
let isRecording: boolean = false
let recordingDuration: number = 0
let recordedBlob: Blob | null = null

const handleStart = async () => {
    try {
        recordedBlob = null
        await startRecording()
        isRecording = true
        intervalId = setInterval(() => recordingDuration++, 1000)
    } catch (error) {
        const err = error as {message: string}
        alert(err.message)
    }
}

const handleStop = async () => {
    recordedBlob = await stopRecording()
    clearInterval(intervalId)
    isRecording = false
}

const handleSave = async () => {
    if (recordedBlob) {
        await saveRecording(recordedBlob, recordingDuration)
        recordedBlob = null
        await fetchRecordings()
    }
}

const handleDelete = () => {
    if (confirm('Are you sure you want to delete this recording?')) recordedBlob = null
}
</script>

<style>
button {
    padding: 10px;
    margin: 5px;
    border: none;
    cursor: pointer;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border-radius: 5px;
}
button:hover {
    background-color: #0056b3;
}
</style>
