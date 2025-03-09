import {del, get, keys, set} from 'idb-keyval'

type Recording = {
    blob: Blob
    timestamp: number
}

// const STORE_NAME = 'audio_recordings'

export const saveRecording = async (recording: Blob) => {
    const id = crypto.randomUUID()
    await set(id, {
        blob: recording,
        timestamp: Date.now(),
    })
    return id
}

export const getAllRecordings = async (): Promise<Recording[]> => {
    const allKeys = await keys()
    const recordings = Promise.all(allKeys.map(key => get(key)))

    // TODO: Delete later
    console.log('Retrieved Recordings from IndexedDB:', recordings)

    return recordings
}

export const deleteRecording = async (id: string) => {
    await del(id)
}
