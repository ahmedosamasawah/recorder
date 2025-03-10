export function getTimeAgo(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const diffSeconds = Math.floor(diff / 1000)

    if (diffSeconds < 60) return 'منذ ثوان'

    const diffMinutes = Math.floor(diffSeconds / 60)

    if (diffMinutes < 60)
        if (diffMinutes === 1) return 'منذ دقيقة'
        else if (diffMinutes === 30) return 'منذ نصف ساعة'
        else return `منذ ${getArabicNumber(diffMinutes)} دقائق`

    const diffHours = Math.floor(diffMinutes / 60)

    if (diffHours < 24)
        if (diffHours === 1) return 'منذ ساعة'
        else return `${getArabicNumber(diffHours)} ساعات`

    const diffDays = Math.floor(diffHours / 24)

    if (diffDays === 1) return 'منذ يوم'
    else return `${getArabicNumber(diffDays)} أيام`
}

function getArabicNumber(num: number): string {
    const numbers: {[key: number]: string} = {
        1: 'واحدة',
        2: 'اثنتين',
        3: 'ثلاث',
        4: 'أربع',
        5: 'خمس',
        6: 'ست',
        7: 'سبع',
        8: 'ثمان',
        9: 'تسع',
        10: 'عشر',
        30: 'نصف',
    }

    return numbers[num] || num.toString()
}
