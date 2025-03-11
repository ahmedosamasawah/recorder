<div class="time-display">
    <span class="current">{formattedCurrent}</span>
</div>

<script lang="ts">
export const duration: number = 0
export let currentTime: number = 0
export const showRemaining: boolean = false

function formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`

    return formattedTime
}

$: formattedCurrent = formatTime(currentTime)
// $: formattedDuration = formatTime(duration)
// $: formattedRemaining = formatTime(Math.max(0, duration - currentTime))
</script>

<style>
.time-display {
    font-family: inherit;
    font-size: 0.875rem;
    color: #666;
    user-select: none;
}

/* .separator {
    opacity: 0.6;
} */
</style>
