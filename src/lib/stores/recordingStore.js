import {derived, get, writable} from 'svelte/store'

import * as StorageService from '../services/StorageService.js'

export const loading = writable(true)
export const recordings = writable([])
export const current_recording = writable(null)
export const has_recordings = derived(recordings, $recordings => $recordings.length > 0)

export const load_recordings = async () => {
    loading.set(true)
    try {
        const loaded_recordings = await StorageService.get_all_recordings()
        recordings.set(loaded_recordings)
    } catch (error) {
        console.error('Failed to load recordings:', error)
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
export const save_recording = async (blob, duration, name) => {
    try {
        // Ensure duration is a valid number
        const valid_duration = isFinite(duration) ? duration : 0

        const id = await StorageService.save_recording(blob, valid_duration, name)
        await load_recordings()

        // Set the new recording as current
        const all_recordings = get(recordings)
        const new_recording = all_recordings.find(r => r.id === id)
        if (new_recording) current_recording.set(new_recording)
    } catch (error) {
        console.error('Failed to save recording:', error)
    }
}

/**
 * Delete a recording
 * @param id The ID of the recording to delete
 */
export const delete_recording = async id => {
    try {
        const current = get(current_recording)

        await StorageService.delete_recording(id)
        await load_recordings()

        // If we deleted the current recording, select a new one
        if (current && current.id === id) {
            const remaining_recordings = get(recordings)
            if (remaining_recordings.length > 0) current_recording.set(remaining_recordings[0])
            else current_recording.set(null)
        }
    } catch (error) {
        console.error('Failed to delete recording:', error)
    }
}

/**
 * Rename a recording
 * @param id The ID of the recording to rename
 * @param new_name The new name
 */
export const rename_recording = async (id, new_name) => {
    try {
        await StorageService.rename_recording(id, new_name)
        await load_recordings()

        // Update current recording if needed
        const current = get(current_recording)
        if (current && current.id === id) {
            const updated_recordings = get(recordings)
            const updated_recording = updated_recordings.find(r => r.id === id)
            if (updated_recording) current_recording.set(updated_recording)
        }
    } catch (error) {
        console.error('Failed to rename recording:', error)
    }
}

/**
 * Update a recording's duration
 * @param id The ID of the recording
 * @param duration The new duration in seconds
 */
export const update_duration = async (id, duration) => {
    try {
        await StorageService.update_recording_duration(id, duration)

        // Update recordings list and current recording
        recordings.update(recs =>
            recs.map(r => {
                if (r.id === id) return {...r, duration}
                return r
            }),
        )

        const current = get(current_recording)
        if (current && current.id === id)
            current_recording.update(rec => {
                if (rec) return {...rec, duration}
                return rec
            })
    } catch (error) {
        console.error('Failed to update recording duration:', error)
    }
}

/**
 * Set the current recording
 * @param recording The recording to set as current
 */
export const set_current_recording = recording => current_recording.set(recording)

/**
 * Download a recording
 * @param recording The recording to download
 */
export const download_recording = recording => {
    try {
        const a = document.createElement('a')
        a.href = recording.url
        a.download = `${recording.name}.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    } catch (error) {
        console.error('Failed to download recording:', error)
    }
}
