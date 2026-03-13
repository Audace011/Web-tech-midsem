import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LS_KEYS, ROLES } from '@/helpers/constants'

// Seeded demo accounts (pre-verified)
const SEED_USERS = [
    { id: 'u-admin', name: 'Admin User', email: 'admin@laf.com', password: 'admin123', role: ROLES.ADMIN, avatar: null, emailVerified: true, createdAt: '2024-01-01T00:00:00Z' },
    { id: 'u-1', name: 'Alice Martin', email: 'alice@example.com', password: 'alice123', role: ROLES.USER, avatar: null, emailVerified: true, createdAt: '2024-03-10T08:30:00Z' },
    { id: 'u-2', name: 'Bob Johnson', email: 'bob@example.com', password: 'bob12345', role: ROLES.USER, avatar: null, emailVerified: true, createdAt: '2024-04-01T10:00:00Z' },
]

function loadUsers() {
    try {
        const raw = localStorage.getItem('laf_users')
        return raw ? JSON.parse(raw) : SEED_USERS
    } catch { return SEED_USERS }
}

function saveUsers(users) {
    localStorage.setItem('laf_users', JSON.stringify(users))
}

export const useAuthStore = defineStore('auth', () => {
    const allUsers = ref(loadUsers())
    const user = ref(JSON.parse(localStorage.getItem(LS_KEYS.USER) || 'null'))
    const token = ref(localStorage.getItem(LS_KEYS.TOKEN) || null)

    const isLoggedIn = computed(() => !!user.value && !!token.value)
    const isAdmin = computed(() => user.value?.role === ROLES.ADMIN)

    function _persist(u, t) {
        user.value = u
        token.value = t
        localStorage.setItem(LS_KEYS.USER, JSON.stringify(u))
        localStorage.setItem(LS_KEYS.TOKEN, t)
    }

    function _clearPersist() {
        user.value = null
        token.value = null
        localStorage.removeItem(LS_KEYS.USER)
        localStorage.removeItem(LS_KEYS.TOKEN)
    }

    async function login(email, password) {
        const found = allUsers.value.find(
            u => u.email === email && u.password === password
        )
        if (!found) throw new Error('Invalid email or password.')
        const { password: _p, ...safeUser } = found
        _persist(safeUser, `mock-token-${found.id}`)
        return safeUser
    }

    async function register({ name, email, password }) {
        if (allUsers.value.find(u => u.email === email)) {
            throw new Error('An account with this email already exists.')
        }
        const newUser = {
            id: `u-${Date.now()}`,
            name, email, password,
            role: ROLES.USER,
            avatar: null,
            emailVerified: true,   // no verification required — instant access
            createdAt: new Date().toISOString(),
        }
        allUsers.value.push(newUser)
        saveUsers(allUsers.value)
        const { password: _p, ...safeUser } = newUser
        _persist(safeUser, `mock-token-${newUser.id}`)
        return safeUser
    }

    function logout() {
        _clearPersist()
    }

    async function updateProfile(data) {
        const idx = allUsers.value.findIndex(u => u.id === user.value.id)
        if (idx === -1) throw new Error('User not found.')
        allUsers.value[idx] = { ...allUsers.value[idx], ...data }
        saveUsers(allUsers.value)
        const { password: _p, ...safeUser } = allUsers.value[idx]
        _persist(safeUser, token.value)
    }

    function getAllUsers() {
        return allUsers.value.map(({ password: _p, ...u }) => u)
    }

    function banUser(userId) {
        const idx = allUsers.value.findIndex(u => u.id === userId)
        if (idx !== -1) {
            allUsers.value[idx].banned = !allUsers.value[idx].banned
            saveUsers(allUsers.value)
        }
    }

    function markEmailVerified() {
        const idx = allUsers.value.findIndex(u => u.id === user.value?.id)
        if (idx !== -1) {
            allUsers.value[idx].emailVerified = true
            saveUsers(allUsers.value)
            const { password: _p, verifyToken: _t, ...safeUser } = allUsers.value[idx]
            _persist(safeUser, token.value)
        }
    }

    /**
     * Called when user clicks the verification link in their email.
     * Finds the user by their stored verifyToken, marks them verified.
     * @param {string} tokenFromUrl
     * @returns {boolean} true if successfully verified
     */
    function verifyEmailByToken(tokenFromUrl) {
        const idx = allUsers.value.findIndex(u => u.verifyToken === tokenFromUrl)
        if (idx === -1) return false
        allUsers.value[idx].emailVerified = true
        delete allUsers.value[idx].verifyToken   // token used — remove it
        saveUsers(allUsers.value)
        // Update current session if this is the logged-in user
        if (user.value && user.value.id === allUsers.value[idx].id) {
            const { password: _p, verifyToken: _t, ...safeUser } = allUsers.value[idx]
            _persist(safeUser, token.value)
        }
        return true
    }

    return {
        user, token, isLoggedIn, isAdmin,
        login, register, logout, updateProfile, getAllUsers, banUser,
        markEmailVerified, verifyEmailByToken,
    }
})
