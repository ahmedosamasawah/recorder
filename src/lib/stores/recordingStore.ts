import {derived, get, writable} from 'svelte/store'

import * as StorageService from '../services/StorageService.ts'
import type {Recording} from '../types'

export const recordings = writable<Recording[]>([])

export const currentRecording = writable<Recording | null>(null)

export const loading = writable<boolean>(true)

export const hasRecordings = derived(recordings, $recordings => $recordings.length > 0)

export const loadRecordings = async (): Promise<void> => {
    loading.set(true)
    try {
        const loadedRecordings = await StorageService.getAllRecordings()
        recordings.set(loadedRecordings)
    } catch (error) {
        console.error('Failed to load recordings:', error) // TODO: Delete later
    } finally {
        loading.set(false)
    }
}

/**
 * Save a new recording
 * @param blob The audio blob
 * @param duration The duration in seconds
 * @param name Optional custom name
 */
export const saveRecording = async (blob: Blob, duration: number, name?: string): Promise<void> => {
    try {
        const id = await StorageService.saveRecording(blob, duration, name)
        await loadRecordings()

        // Set the new recording as current
        const allRecordings = get(recordings)
        const newRecording = allRecordings.find(r => r.id === id)
        if (newRecording) currentRecording.set(newRecording)
    } catch (error) {
        console.error('Failed to save recording:', error) // TODO: Delete later
    }
}

/**
 * Delete a recording
 * @param id The ID of the recording to delete
 */
export const deleteRecording = async (id: string): Promise<void> => {
    try {
        const current = get(currentRecording)

        await StorageService.deleteRecording(id)
        await loadRecordings()

        // If we deleted the current recording, select a new one
        if (current && current.id === id) {
            const remainingRecordings = get(recordings)
            if (remainingRecordings.length > 0) currentRecording.set(remainingRecordings[0])
            else currentRecording.set(null)
        }
    } catch (error) {
        console.error('Failed to delete recording:', error) // TODO: Delete later
    }
}

/**
 * Rename a recording
 * @param id The ID of the recording to rename
 * @param newName The new name
 */
export const renameRecording = async (id: string, newName: string): Promise<void> => {
    try {
        await StorageService.renameRecording(id, newName)
        await loadRecordings()

        // Update current recording if needed
        const current = get(currentRecording)
        if (current && current.id === id) {
            const updatedRecordings = get(recordings)
            const updatedRecording = updatedRecordings.find(r => r.id === id)
            if (updatedRecording) currentRecording.set(updatedRecording)
        }
    } catch (error) {
        console.error('Failed to rename recording:', error) // TODO: Delete later
    }
}

/**
 * Update a recording's duration
 * @param id The ID of the recording
 * @param duration The new duration in seconds
 */
export const updateDuration = async (id: string, duration: number): Promise<void> => {
    try {
        await StorageService.updateRecordingDuration(id, duration)

        // Update recordings list and current recording
        recordings.update(recs =>
            recs.map(r => {
                if (r.id === id) return {...r, duration}

                return r
            }),
        )

        const current = get(currentRecording)
        if (current && current.id === id)
            currentRecording.update(rec => {
                if (rec) return {...rec, duration}

                return rec
            })
    } catch (error) {
        console.error('Failed to update recording duration:', error) // TODO: Delete later
    }
}

/**
 * Set the current recording
 * @param recording The recording to set as current
 */
export const setCurrentRecording = (recording: Recording): void => currentRecording.set(recording)

/**
 * Download a recording
 * @param recording The recording to download
 */
export const downloadRecording = (recording: Recording): void => {
    try {
        const a = document.createElement('a')
        a.href = recording.url
        a.download = `${recording.name}.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    } catch (error) {
        console.error('Failed to download recording:', error) // TODO: Delete later
    }
}
