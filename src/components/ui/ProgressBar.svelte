<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class:rounded
    class:interactive
    bind:this={track}
    class="progress-track"
    on:click={handleClick}
    style="
      height: {height};
      background-color: {backgroundColor};
    "
>
    <div
        style="
        background-color: {progressColor};
        width: {Math.min(100, Math.max(0, (value / max) * 100))}%;
        "
        class="progress-fill"
        class:rounded
    ></div>
</div>

<script lang="ts">
export let max: number = 100
export let value: number = 0
export let height: string = '4px'
export let rounded: boolean = true
export let interactive: boolean = false
export let progressColor: string = '#4a86e8'
export let backgroundColor: string = '#f0f0f0'

// For seeking functionality
export let onSeek: ((_percent: number) => void) | null = null

let track: HTMLDivElement

function handleClick(e: MouseEvent) {
    if (!interactive || !onSeek) return

    const rect = track.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const percentage = offsetX / rect.width

    onSeek(percentage)
}
</script>

<style>
.progress-track {
    width: 100%;
    overflow: hidden;
    position: relative;
}

.progress-fill {
    height: 100%;
    transition: width 0.1s ease;
}

.rounded {
    border-radius: 9999px;
}

.interactive {
    cursor: pointer;
}

.interactive:hover {
    opacity: 0.9;
}
</style>
