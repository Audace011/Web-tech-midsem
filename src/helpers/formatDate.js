/**
 * Format a date string to a relative time (e.g., "2 hours ago")
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelative(date) {
    const now = new Date()
    const d = new Date(date)
    const diff = now - d // ms

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    if (weeks < 5) return `${weeks}w ago`
    if (months < 12) return `${months}mo ago`
    return formatFull(date)
}

/**
 * Format a date to a full human-readable string
 * @param {string|Date} date
 * @returns {string}
 */
export function formatFull(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(new Date(date))
}

/**
 * Format for input[type=date] value
 * @param {string|Date} date
 * @returns {string}
 */
export function formatInputDate(date) {
    const d = new Date(date)
    return d.toISOString().split('T')[0]
}
