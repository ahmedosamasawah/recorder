import {del, get, keys, set} from 'idb-keyval'

type Recording = {
    id: string
    blob: Blob
    duration: number
    timestamp: number
}

export const saveRecording = async (blob: Blob, duration: number) => {
    const id = crypto.randomUUID()
    const recording: Recording = {id, blob, timestamp: Date.now(), duration}

    await set(id, recording)
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
