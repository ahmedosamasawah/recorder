import {get} from 'svelte/store'

import {recordingProgress} from '../stores/audioStore.ts'

let mediaRecorder: MediaRecorder | null = null
let recordingStream: MediaStream | null = null
let audioChunks: Blob[] = []

/**
 * Start recording audio from the user's microphone
 * @returns Promise that resolves when recording starts
 */
export const startRecording = async (): Promise<void> => {
    try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({audio: true})
        recordingStream = stream

        // Configure media recorder (mp4 for broader compatibility)
        mediaRecorder = new MediaRecorder(stream, {mimeType: 'video/mp4'})
        audioChunks = []

        // Update recording progress store
        recordingProgress.update(state => ({
            ...state,
            startTime: Date.now(),
            isActive: true,
        }))

        // Set up data handling
        mediaRecorder.addEventListener('dataavailable', event => {
            if (event.data.size > 0) audioChunks.push(event.data)
        })

        // Start recording
        mediaRecorder.start()
        return Promise.resolve()
    } catch (error) {
        console.error('Error starting recording:', error) // TODO: Delete later
        return Promise.reject(new Error('Failed to access microphone'))
    }
}

/**
 * Stop the current recording
 * @returns Promise that resolves with the recorded audio blob
 */
export const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            reject(new Error('No active recording'))
            return
        }

        // Set up stop handler to create the audio blob
        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks, {type: 'video/mp4'})

            // Calculate recording duration
            const state = get(recordingProgress)
            const duration = state.startTime ? (Date.now() - state.startTime) / 1000 : 0

            // Update store
            recordingProgress.update(state => ({
                ...state,
                duration,
                isActive: false,
                startTime: null,
            }))

            // Cleanup resources
            cleanupRecording()

            // Return the recorded blob
            resolve(audioBlob)
        })

        // Stop the recording
        mediaRecorder.stop()
    })
}

function cleanupRecording(): void {
    if (recordingStream) {
        recordingStream.getTracks().forEach(track => track.stop())
        recordingStream = null
    }
    audioChunks = []
    mediaRecorder = null
}

export const isRecordingActive = (): boolean => {
    return !!(mediaRecorder && mediaRecorder.state === 'recording')
}

/**
 * Create an audio element with the given blob
 * @param blob The audio blob
 * @returns HTMLAudioElement configured for playback
 */
export const createAudioElement = (blob: Blob): HTMLAudioElement => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    audio.load()
    return audio
}
