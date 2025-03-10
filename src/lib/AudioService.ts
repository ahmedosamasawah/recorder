let audioChunks: Blob[] = []
let mediaRecorder: MediaRecorder

export const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true})
        mediaRecorder = new MediaRecorder(stream)
        audioChunks = []

        mediaRecorder.ondataavailable = event => audioChunks.push(event.data)
        mediaRecorder.start()
    } catch (error) {
        console.error('تم رفض الوصول إلى الميكروفون:', error) // TODO: Delete later
        throw new Error('يتطلب الوصول إلى الميكروفون لتسجيل الصوت.')
    }
}

export const stopRecording = async (): Promise<Blob> => {
    return new Promise(resolve => {
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, {type: 'audio/mp4'})
            audioChunks = []

            // TODO: Delete later
            console.log('Recording Stopped:')
            console.log('Blob Size:', audioBlob.size)
            console.log('Blob Type:', audioBlob.type)

            resolve(audioBlob)
        }
        mediaRecorder.stop()
    })
}
