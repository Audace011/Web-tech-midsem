/**
 * Convert a File object to a base64 data URL
 * @param {File} file
 * @returns {Promise<string>}
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

/**
 * Validate image file type and size
 * @param {File} file
 * @param {number} maxMB - max size in MB
 * @returns {{ valid: boolean, message: string }}
 */
export function validateImageFile(file, maxMB = 5) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, message: 'Only JPEG, PNG, WebP, or GIF images are allowed.' }
    }
    if (file.size > maxMB * 1024 * 1024) {
        return { valid: false, message: `Image must be smaller than ${maxMB}MB.` }
    }
    return { valid: true, message: '' }
}

/**
 * Generate a placeholder image URL for demo items
 * @param {string} category
 * @returns {string}
 */
export function placeholderImage(category = 'other') {
    const map = {
        phone: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
        laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
        wallet: 'https://images.unsplash.com/photo-1627843563941-1b0ad5b71c6d?w=400&h=300&fit=crop',
        'id-card': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop',
        keys: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        bag: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
        clothing: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=400&h=300&fit=crop',
        jewelry: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
        other: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=300&fit=crop',
    }
    return map[category] || map.other
}
