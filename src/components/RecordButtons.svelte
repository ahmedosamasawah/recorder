<div class="record-controls">
    <div class="buttons-container">
        {#if isRecording}
            <Button
                type="icon"
                title="توقف"
                size="circle"
                icon={StopIcon}
                styles="stop-button"
                disabled={!isRecording}
                on:click={handleStopRecording}
            />
        {:else}
            <Button
                title="سجل"
                type="icon"
                size="circle"
                icon={RecordIcon}
                disabled={isRecording}
                styles="record-button"
                on:click={handleStartRecording}
            />
        {/if}
    </div>

    {#if isRecording}
        <div class="recording-indicator">
            <div class="pulse"></div>
            <TimeDisplay currentTime={elapsedTime} duration={0} />
        </div>
    {/if}
</div>

<script lang="ts">
import {createEventDispatcher, onDestroy} from 'svelte'

import {startRecording, stopRecording} from '../lib/services/AudioService.ts'
import {recordingProgress} from '../lib/stores/audioStore.ts'
import {saveRecording} from '../lib/stores/recordingStore.ts'
import {RecordIcon, StopIcon} from '../lib/utils/icons.ts'
import Button from './ui/Button.svelte'
import TimeDisplay from './ui/TimeDisplay.svelte'

let elapsedTime = 0
export let isRecording: boolean
let intervalId: number | undefined
const dispatch = createEventDispatcher()

// Subscribe to recording progress store
const unsubscribe = recordingProgress.subscribe(state => {
    isRecording = state.isActive
    dispatch('recordingStateChange', {isRecording: state.isActive})
})

$: if (isRecording && !intervalId) startTimer()
else if (!isRecording && intervalId) stopTimer()

function startTimer() {
    elapsedTime = 0
    intervalId = window.setInterval(() => (elapsedTime += 1), 1000)
}

function stopTimer() {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = undefined
    }
}

async function handleStartRecording() {
    try {
        await startRecording()
    } catch (error) {
        console.error('Failed to start recording:', error) // TODO: Delete later
        alert('فشل في بدء التسجيل. الرجاء التأكد من إتاحة الوصول إلى الميكروفون.') // TODO: Use toast if Mostafa wanted
    }
}

async function handleStopRecording() {
    try {
        const audioBlob = await stopRecording()
        await saveRecording(audioBlob, elapsedTime)
        elapsedTime = 0
    } catch (error) {
        console.error('Failed to stop recording:', error) // TODO: Delete later
        alert('حدث خطأ أثناء حفظ التسجيل.') // TODO: Use toast if Mostafa wanted
    }
}

onDestroy(() => {
    unsubscribe()
    stopTimer()
})
</script>

<style>
.record-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
}

.buttons-container {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 0.5rem;
}

.recording-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.pulse {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background-color: #ef4444;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }

    70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }

    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
}
</style>
