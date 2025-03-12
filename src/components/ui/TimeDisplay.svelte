<div class="select-none text-sm text-gray-600">
    <span>{formatted_current}</span>
</div>

<script>
let formatted_current = $derived(format_time(current_time))
let {duration, current_time, show_remaining} = $props()

function format_time(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const remaining_seconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remaining_seconds.toString().padStart(2, '0')}`
}
</script>
