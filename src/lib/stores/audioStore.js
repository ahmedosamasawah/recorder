import {derived, writable} from 'svelte/store'

const DEFAULT_PLAYBACK_STATE = {
    duration: 0,
    repeat: false,
    current_time: 0,
    is_playing: false,
    playback_rate: 1.0,
}

const DEFAULT_RECORDING_PROGRESS = {
    duration: 0,
    is_active: false,
    start_time: null,
}

// Store for tracking audio playback state
export const playback_state = writable(DEFAULT_PLAYBACK_STATE)

// Store for tracking recording progress
export const recording_progress = writable(DEFAULT_RECORDING_PROGRESS)

// Derived store for formatted current time
export const formatted_current_time = derived(playback_state, $playback_state =>
    format_time($playback_state.current_time),
)

// Derived store for formatted duration
export const formatted_duration = derived(playback_state, $playback_state =>
    format_time($playback_state.duration),
)

// Derived store for remaining time
export const formatted_remaining_time = derived(playback_state, $playback_state => {
    const remaining = $playback_state.duration - $playback_state.current_time
    return format_time(remaining >= 0 ? remaining : 0)
})

// Derived store for progress percentage
export const progress_percentage = derived(playback_state, $playback_state => {
    if ($playback_state.duration > 0)
        return ($playback_state.current_time / $playback_state.duration) * 100

    return 0
})

/**
 * Format time in seconds to MM:SS format
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
function format_time(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const remaining_seconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remaining_seconds.toString().padStart(2, '0')}`
}

export const reset_playback_state = () => playback_state.set(DEFAULT_PLAYBACK_STATE)

export const reset_recording_progress = () => recording_progress.set(DEFAULT_RECORDING_PROGRESS)
