import {derived, writable} from 'svelte/store'

import type {PlaybackState, RecordingProgress} from '../types'

const DEFAULT_PLAYBACK_STATE: PlaybackState = {
    duration: 0,
    currentTime: 0,
    repeat: false,
    isPlaying: false,
    playbackRate: 1.0,
}

const DEFAULT_RECORDING_PROGRESS: RecordingProgress = {
    startTime: null,
    duration: 0,
    isActive: false,
}

// Store for tracking audio playback state
export const playbackState = writable<PlaybackState>(DEFAULT_PLAYBACK_STATE)

// Store for tracking recording progress
export const recordingProgress = writable<RecordingProgress>(DEFAULT_RECORDING_PROGRESS)

// Derived store for formatted current time
export const formattedCurrentTime = derived(playbackState, $playbackState =>
    formatTime($playbackState.currentTime),
)

// Derived store for formatted duration
export const formattedDuration = derived(playbackState, $playbackState =>
    formatTime($playbackState.duration),
)

// Derived store for remaining time
export const formattedRemainingTime = derived(playbackState, $playbackState => {
    const remaining = $playbackState.duration - $playbackState.currentTime
    return formatTime(remaining >= 0 ? remaining : 0)
})

// Derived store for progress percentage
export const progressPercentage = derived(playbackState, $playbackState => {
    if ($playbackState.duration > 0)
        return ($playbackState.currentTime / $playbackState.duration) * 100

    return 0
})

/**
 * Format time in seconds to MM:SS format
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
function formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

export const resetPlaybackState = (): void => playbackState.set(DEFAULT_PLAYBACK_STATE)

export const resetRecordingProgress = (): void => recordingProgress.set(DEFAULT_RECORDING_PROGRESS)
