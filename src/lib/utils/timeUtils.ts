/**
 * Format seconds to MM:SS display format
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Format seconds to ISO time format (for display)
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export function formatTimeISO(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00'
    const date = new Date(seconds * 1000)
    return date.toISOString().substr(14, 5)
}

/**
 * Get relative time description (e.g., "2 hours ago")
 * @param timestamp The timestamp to compare
 * @returns Human-readable time difference
 */
export function getTimeAgo(timestamp: number | Date): string {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    const now = new Date()

    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    }

    const timeUnits = {
        year: ['سنة', 'سنتين', 'سنوات'],
        month: ['شهر', 'شهرين', 'شهور'],
        week: ['أسبوع', 'أسبوعين', 'أسابيع'],
        day: ['يوم', 'يومين', 'أيام'],
        hour: ['ساعة', 'ساعتين', 'ساعات'],
        minute: ['دقيقة', 'دقيقتين', 'دقائق'],
        second: ['ثانية', 'ثانيتين', 'ثواني'],
    }

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit)

        if (interval >= 1) {
            const unitKey = unit as keyof typeof timeUnits
            let unitWord

            if (interval === 1) {
                unitWord = timeUnits[unitKey][0]
            } else if (interval === 2) {
                unitWord = timeUnits[unitKey][1]
            } else if (interval <= 10) {
                unitWord = timeUnits[unitKey][2]
            } else {
                unitWord = timeUnits[unitKey][2]
            }

            return `منذ ${interval} ${unitWord}`
        }
    }

    return 'منذ لحظات'
}
