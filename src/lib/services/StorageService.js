import {del, get, keys, set} from 'idb-keyval'

const RECORDING_PREFIX = 'recording_'

/**
 * Save a new recording to IndexedDB
 * @param blob The audio blob to save
 * @param duration The duration of the recording in seconds
 * @param name Optional name for the recording (default: based on timestamp)
 * @returns Promise with the recording ID
 */
export const save_recording = async (blob, duration, name) => {
    try {
        const id = `${RECORDING_PREFIX}${Date.now()}`

        // Make sure name and duration are correctly assigned
        const recording_name = name || `تسجيل ${new Date().toLocaleTimeString()}`

        /**
         * Determines an appropriate name for the recording:
         * If a custom name is provided, it uses that name
         * If no name is provided, it counts existing recordings and generates a sequential name ("تسجيل 1", "تسجيل 2", etc.)
         * To use it, comment line 17 ^^
         */
        // let recording_name;
        // if (name)
        //     recording_name = name;
        //  else {
        //     // Get all existing recordings to determine the next number
        //     const all_keys = await keys();
        //     const recording_keys = all_keys.filter(
        //         key => typeof key === 'string' && key.startsWith(RECORDING_PREFIX)
        //     );

        //     // The new recording number will be the count of existing recordings + 1
        //     const recording_number = recording_keys.length + 1;
        //     recording_name = `تسجيل ${recording_number}`;
        // }

        const recording = {
            id,
            blob,
            date: new Date(),
            url: '',
            name: recording_name,
            duration: duration || 0,
        }

        await set(id, recording)
        return id
    } catch (error) {
        console.error('Error saving recording:', error)
        throw new Error('Failed to save recording')
    }
}

/**
 * Load all recordings from IndexedDB
 * @returns Promise with array of recordings sorted by date (newest first)
 */
export const get_all_recordings = async () => {
    try {
        const all_keys = await keys()
        const recording_keys = all_keys.filter(
            key => typeof key === 'string' && key.startsWith(RECORDING_PREFIX),
        )

        const recording_promises = recording_keys.map(async key => {
            const recording = await get(key)
            if (recording && recording.blob) {
                recording.url = URL.createObjectURL(recording.blob)
                return recording
            }
            return null
        })

        const recordings = (await Promise.all(recording_promises))
            .filter(rec => rec !== null)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return recordings
    } catch (error) {
        console.error('Error loading recordings:', error)
        return []
    }
}

/**
 * Update an existing recording in IndexedDB
 * @param recording The recording to update
 * @returns Promise resolving when complete
 */
export const update_recording = async recording => {
    try {
        const recording_to_save = {
            ...recording,
            url: '',
        }

        await set(recording.id, recording_to_save)
    } catch (error) {
        console.error('Error updating recording:', error)
        throw new Error('Failed to update recording')
    }
}

/**
 * Delete a recording from IndexedDB
 * @param id The ID of the recording to delete
 * @returns Promise resolving when complete
 */
export const delete_recording = async id => {
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
 * @param new_name The new name for the recording
 * @returns Promise resolving when complete
 */
export const rename_recording = async (id, new_name) => {
    try {
        const recording = await get(id)
        if (recording) {
            const updated_recording = {
                ...recording,
                name: new_name,
                url: '',
            }
            await set(id, updated_recording)
        } else throw new Error('Recording not found')
    } catch (error) {
        console.error('Error renaming recording:', error)
        throw new Error('Failed to rename recording')
    }
}

/**
 * Update the duration of a recording
 * @param id The ID of the recording to update
 * @param duration The new duration in seconds
 * @returns Promise resolving when complete
 */
export const update_recording_duration = async (id, duration) => {
    try {
        const recording = await get(id)
        if (recording) {
            const updated_recording = {
                ...recording,
                duration,
                url: '',
            }
            await set(id, updated_recording)
        } else throw new Error('Recording not found')
    } catch (error) {
        console.error('Error updating recording duration:', error)
        throw new Error('Failed to update recording duration')
    }
}
