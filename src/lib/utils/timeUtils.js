/**
 * Format seconds to MM:SS display format
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export function format_time(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const remaining_seconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remaining_seconds.toString().padStart(2, '0')}`
}

/**
 * Format seconds to ISO time format (for display)
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export function format_time_iso(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00'
    const date = new Date(seconds * 1000)
    return date.toISOString().substr(14, 5)
}

/**
 * Get relative time description (e.g., "2 hours ago")
 * @param timestamp The timestamp to compare
 * @returns Human-readable time difference
 */
export function get_time_ago(timestamp) {
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

    const time_units = {
        year: ['سنة', 'سنتين', 'سنوات'],
        month: ['شهر', 'شهرين', 'شهور'],
        week: ['أسبوع', 'أسبوعين', 'أسابيع'],
        day: ['يوم', 'يومين', 'أيام'],
        hour: ['ساعة', 'ساعتين', 'ساعات'],
        minute: ['دقيقة', 'دقيقتين', 'دقائق'],
        second: ['ثانية', 'ثانيتين', 'ثواني'],
    }

    for (const [unit, seconds_in_unit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / seconds_in_unit)

        if (interval >= 1) {
            const unit_key = unit
            let unit_word

            if (interval === 1) {
                unit_word = time_units[unit_key][0]
            } else if (interval === 2) {
                unit_word = time_units[unit_key][1]
            } else if (interval <= 10) {
                unit_word = time_units[unit_key][2]
            } else {
                unit_word = time_units[unit_key][2]
            }

            return `منذ ${interval} ${unit_word}`
        }
    }

    return 'منذ لحظات'
}
