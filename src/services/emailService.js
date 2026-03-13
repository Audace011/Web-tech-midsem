/**
 * emailService.js
 * Sends transactional emails via EmailJS (browser-side, no backend needed).
 * Credentials are loaded from .env at build time.
 */
import emailjs from '@emailjs/browser'

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

/**
 * Send an email verification link to the newly registered user.
 * @param {{ name: string, email: string }} user
 * @param {string} token  - The unique verification token stored on the user
 * @returns {Promise}
 */
export async function sendVerificationEmail(user, token) {
    // Build the verification URL — works both local and deployed
    const baseUrl = window.location.origin
    const verifyLink = `${baseUrl}/verify-email?token=${token}`

    const templateParams = {
        to_email: user.email,
        user_name: user.name,
        verify_link: verifyLink,
    }

    return emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
}
