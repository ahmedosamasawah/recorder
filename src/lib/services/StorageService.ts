import {del, get, keys, set} from 'idb-keyval'

import type {Recording} from '../types'

const RECORDING_PREFIX = 'recording_'

/**
 * Save a new recording to IndexedDB
 * @param blob The audio blob to save
 * @param duration The duration of the recording in seconds
 * @param name Optional name for the recording (default: based on timestamp)
 * @returns Promise with the recording ID
 */
export const saveRecording = async (
    blob: Blob,
    duration: number,
    name?: string,
): Promise<string> => {
    try {
        const id = `${RECORDING_PREFIX}${Date.now()}`

        const recording: Recording = {
            id,
            blob,
            date: new Date(),
            url: '',
            name: name || `Recording ${new Date().toLocaleTimeString()}`,
            duration,
        }

        await set(id, recording)
        return id
    } catch (error) {
        console.error('Error saving recording:', error) // TODO: Delete later
        throw new Error('Failed to save recording')
    }
}

/**
 * Load all recordings from IndexedDB
 * @returns Promise with array of recordings sorted by date (newest first)
 */
export const getAllRecordings = async (): Promise<Recording[]> => {
    try {
        const allKeys = await keys()
        const recordingKeys = allKeys.filter(
            (key): key is string => typeof key === 'string' && key.startsWith(RECORDING_PREFIX),
        )

        const recordingPromises = recordingKeys.map(async key => {
            const recording = await get(key)
            if (recording && recording.blob) {
                recording.url = URL.createObjectURL(recording.blob)
                return recording as Recording
            }
            return null
        })

        const recordings = (await Promise.all(recordingPromises))
            .filter((rec): rec is Recording => rec !== null)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return recordings
    } catch (error) {
        console.error('Error loading recordings:', error) // TODO: Delete later
        return []
    }
}

/**
 * Update an existing recording in IndexedDB
 * @param recording The recording to update
 * @returns Promise resolving when complete
 */
export const updateRecording = async (recording: Recording): Promise<void> => {
    try {
        const recordingToSave = {
            ...recording,
            url: '',
        }

        await set(recording.id, recordingToSave)
    } catch (error) {
        console.error('Error updating recording:', error) // TODO: Delete later
        throw new Error('Failed to update recording')
    }
}

/**
 * Delete a recording from IndexedDB
 * @param id The ID of the recording to delete
 * @returns Promise resolving when complete
 */
export const deleteRecording = async (id: string): Promise<void> => {
    try {
        const recording = await get(id)
        if (recording && recording.url) URL.revokeObjectURL(recording.url)

        await del(id)
    } catch (error) {
        console.error('Error deleting recording:', error)
        throw new Error('Failed to delete recording')
    }
}

/**
 * Rename a recording
 * @param id The ID of the recording to rename
 * @param newName The new name for the recording
 * @returns Promise resolving when complete
 */
export const renameRecording = async (id: string, newName: string): Promise<void> => {
    try {
        const recording = await get(id)
        if (recording) {
            const updatedRecording = {
                ...recording,
                name: newName,
                url: '',
            }
            await set(id, updatedRecording)
        } else throw new Error('Recording not found')
    } catch (error) {
        console.error('Error renaming recording:', error) // TODO: Delete later
        throw new Error('Failed to rename recording')
    }
}

/**
 * Update the duration of a recording
 * @param id The ID of the recording to update
 * @param duration The new duration in seconds
 * @returns Promise resolving when complete
 */
export const updateRecordingDuration = async (id: string, duration: number): Promise<void> => {
    try {
        const recording = await get(id)
        if (recording) {
            const updatedRecording = {
                ...recording,
                duration,
                url: '',
            }
            await set(id, updatedRecording)
        } else throw new Error('Recording not found')
    } catch (error) {
        console.error('Error updating recording duration:', error) // TODO: Delete later
        throw new Error('Failed to update recording duration')
    }
}
