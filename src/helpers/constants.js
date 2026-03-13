// Category options
export const CATEGORIES = [
    { value: 'phone', label: 'Phone' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'id-card', label: 'ID / Card' },
    { value: 'keys', label: 'Keys' },
    { value: 'bag', label: 'Bag / Backpack' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'other', label: 'Other' },
]

// Item type
export const ITEM_TYPES = [
    { value: 'lost', label: 'Lost' },
    { value: 'found', label: 'Found' },
]

// Item status
export const STATUSES = [
    { value: 'open', label: 'Open' },
    { value: 'resolved', label: 'Resolved' },
]

// User roles
export const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
}

// Local storage keys
export const LS_KEYS = {
    TOKEN: 'laf_token',
    USER: 'laf_user',
    ITEMS: 'laf_items',
    MESSAGES: 'laf_messages',
    NOTIFICATIONS: 'laf_notifications',
}
