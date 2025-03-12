<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class:rounded
    class:interactive
    bind:this={track}
    class="relative w-full overflow-hidden"
    on:click={handle_click}
    style="
      height: {height};
      background-color: {background_color};
    "
>
    <div
        style="
        background-color: {progress_color};
        width: {Math.min(100, Math.max(0, (value / max) * 100))}%;
        "
        class="transition-width h-full duration-100"
        class:rounded
    ></div>
</div>

<script>
export let max = 100
export let value = 0
export let height = '4px'
export let rounded = true
export let interactive = false
export let progress_color = '#4a86e8'
export let background_color = '#f0f0f0'

// For seeking functionality
export let on_seek = null

let track

function handle_click(e) {
    if (!interactive || !on_seek) return

    const rect = track.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const percentage = offsetX / rect.width

    on_seek(percentage)
}
</script>

<style>
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
