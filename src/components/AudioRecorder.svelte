<div class="recorder-container">
    <button on:click={isRecording ? handleStop : handleStart}>
        {isRecording ? '⏹ Stop' : '⏺ Start'}
    </button>
    <span>{recordingDuration}s</span>

    {#if recordedBlob}
        <audio controls>
            <source src={URL.createObjectURL(recordedBlob)} type="audio/mp4" />
        </audio>
    {/if}
</div>

<script lang="ts">
import {startRecording, stopRecording} from '../lib/AudioService.ts'

let isRecording: boolean = false
let recordingDuration: number = 0
let intervalId: number
let recordedBlob: Blob | null = null

const handleStart = async () => {
    try {
        await startRecording()
        isRecording = true
        intervalId = setInterval(() => recordingDuration++, 1000)
    } catch (error) {
        const err = error as {message: string}
        alert(err.message)
    }
}

const handleStop = async () => {
    const blob = await stopRecording()
    recordedBlob = blob
    clearInterval(intervalId)
    recordingDuration = 0
    isRecording = false
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
