// Represents a stored audio recording
export type Recording = {
    id: string
    blob: Blob
    date: Date
    url: string
    name: string
    duration: number
}

// Recording progress information
export type RecordingProgress = {
    startTime: number | null
    duration: number
    isActive: boolean
}

// Playback state information
export type PlaybackState = {
    isPlaying: boolean
    currentTime: number
    duration: number
    playbackRate: number
    repeat: boolean
}
