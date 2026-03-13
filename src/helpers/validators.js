/**
 * Validate email address — stricter format check
 * - Local part: letters, digits, dots, hyphens, underscores, plus (no consecutive dots)
 * - Domain:     letters, digits, hyphens only
 * - TLD:        2–10 letters ONLY (no numbers)
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const trimmed = (email || '').trim()
    const pattern = /^[a-zA-Z0-9]([a-zA-Z0-9._+\-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,10}$/
    if (!pattern.test(trimmed)) return false
    const [local] = trimmed.split('@')
    if (local.includes('..')) return false
    return true
}

// Popular email provider domains to check typos against
const KNOWN_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'live.com', 'msn.com', 'aol.com', 'protonmail.com', 'mail.com',
    'ymail.com', 'googlemail.com', 'hotmail.co.uk', 'yahoo.co.uk', 'me.com',
]

/** Levenshtein distance between two strings */
function levenshtein(a, b) {
    const m = a.length, n = b.length
    const dp = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    )
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]
}

/**
 * Suggest a correct domain if the email looks like a typo of a popular provider.
 * @param {string} email
 * @returns {string|null}  e.g. "gmail.com" if user typed "gmal.com", null otherwise
 */
export function suggestEmailDomain(email) {
    const trimmed = (email || '').trim()
    if (!trimmed.includes('@')) return null
    const domain = trimmed.split('@').pop().toLowerCase()
    if (!domain || KNOWN_DOMAINS.includes(domain)) return null   // exact match — fine
    // Find the closest known domain within 2 edits
    let best = null, bestDist = Infinity
    for (const known of KNOWN_DOMAINS) {
        const dist = levenshtein(domain, known)
        if (dist < bestDist && dist <= 2) { best = known; bestDist = dist }
    }
    return best  // null if no close match found
}

/**
 * Validate a person's full name
 * - Must be at least 2 characters
 * - Letters, spaces, hyphens and apostrophes only (no digits or symbols)
 * - Must contain at least 2 letters (not just spaces/hyphens)
 * @param {string} name
 * @returns {{ valid: boolean, message: string }}
 */
export function isValidName(name) {
    const trimmed = (name || '').trim()
    if (!trimmed) return { valid: false, message: 'Full name is required.' }
    if (/[0-9]/.test(trimmed)) return { valid: false, message: 'Full name must not contain numbers.' }
    if (/[^a-zA-ZÀ-ÿ\s'\-]/.test(trimmed)) return { valid: false, message: 'Full name must contain letters only.' }
    if ((trimmed.match(/[a-zA-ZÀ-ÿ]/g) || []).length < 2) return { valid: false, message: 'Please enter your full name.' }
    return { valid: true, message: '' }
}

/**
 * Validate password strength
 * Rules: 8+ chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character
 * @param {string} password
 * @returns {{ valid: boolean, message: string, checks: Object }}
 */
export function isStrongPassword(password) {
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    }
    if (!checks.length) return { valid: false, message: 'Password must be at least 8 characters.', checks }
    if (!checks.uppercase) return { valid: false, message: 'Password must contain at least one uppercase letter.', checks }
    if (!checks.lowercase) return { valid: false, message: 'Password must contain at least one lowercase letter.', checks }
    if (!checks.number) return { valid: false, message: 'Password must contain at least one number.', checks }
    if (!checks.special) return { valid: false, message: 'Password must contain at least one special character (e.g. !@#$%).', checks }
    return { valid: true, message: '', checks }
}

/**
 * Check that a field is not empty
 * @param {string} value
 * @returns {boolean}
 */
export function isRequired(value) {
    return typeof value === 'string' ? value.trim().length > 0 : value != null
}

/**
 * Validate an entire form object against a rules map
 * @param {Object} data    - form data
 * @param {Object} rules   - { fieldName: [{ validate: fn, message: string }] }
 * @returns {{ errors: Object, isValid: boolean }}
 */
export function validateForm(data, rules) {
    const errors = {}
    for (const [field, fieldRules] of Object.entries(rules)) {
        for (const rule of fieldRules) {
            if (!rule.validate(data[field])) {
                errors[field] = rule.message
                break
            }
        }
    }
    return { errors, isValid: Object.keys(errors).length === 0 }
}
