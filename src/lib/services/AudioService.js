import {get} from 'svelte/store'
import {recording_progress} from '../stores/audioStore.js'

let audio_chunks = []
let media_recorder = null
let recording_stream = null

/**
 * Start recording audio from the user's microphone
 * @returns Promise that resolves when recording starts
 */
export const start_recording = async () => {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({audio: true})
        recording_stream = stream

        // Configure media recorder (mp4 for broader compatibility)
        media_recorder = new MediaRecorder(stream, {mimeType: 'video/mp4'})
        audio_chunks = []

        // Update recording progress store
        recording_progress.update(state => ({
            ...state,
            start_time: Date.now(),
            is_active: true,
        }))

        // Set up data handling
        media_recorder.addEventListener('dataavailable', event => {
            if (event.data.size > 0) audio_chunks.push(event.data)
        })

        // Start recording
        media_recorder.start()
        return Promise.resolve()
    } catch (error) {
        console.error('Error starting recording:', error)
        return Promise.reject(new Error('Failed to access microphone'))
    }
}

/**
 * Stop the current recording
 * @returns Promise that resolves with the recorded audio blob
 */
export const stop_recording = () => {
    return new Promise((resolve, reject) => {
        if (!media_recorder || media_recorder.state === 'inactive') {
            reject(new Error('No active recording'))
            return
        }

        // Set up stop handler to create the audio blob
        media_recorder.addEventListener('stop', () => {
            const audio_blob = new Blob(audio_chunks, {type: 'video/mp4'})

            // Calculate recording duration
            const state = get(recording_progress)
            const duration = state.start_time ? (Date.now() - state.start_time) / 1000 : 0

            // Log the duration to verify it's being calculated
            console.log('Recording stopped. Duration:', duration) // TODO: DELETE LATER

            // Update store
            recording_progress.update(state => ({
                ...state,
                duration,
                is_active: false,
                start_time: null,
            }))

            // Cleanup resources
            cleanup_recording()

            // Return the recorded blob with duration
            resolve({blob: audio_blob, duration})
        })

        // Stop the recording
        media_recorder.stop()
    })
}
function cleanup_recording() {
    if (recording_stream) {
        recording_stream.getTracks().forEach(track => track.stop())
        recording_stream = null
    }
    audio_chunks = []
    media_recorder = null
}

export const is_recording_active = () => {
    return !!(media_recorder && media_recorder.state === 'recording')
}

/**
 * Create an audio element with the given blob
 * @param blob The audio blob
 * @returns HTMLAudioElement configured for playback
 */
export const create_audio_element = blob => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.load()
    return audio
}
