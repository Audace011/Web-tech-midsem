import { defineStore } from 'pinia'
import { ref } from 'vue'
import { LS_KEYS } from '@/helpers/constants'

function load() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.NOTIFICATIONS) || '[]') }
    catch { return [] }
}

export const useNotificationsStore = defineStore('notifications', () => {
    const notifications = ref(load())

    function save() {
        localStorage.setItem(LS_KEYS.NOTIFICATIONS, JSON.stringify(notifications.value))
    }

    function addNotification({ title, message, type = 'info', link = null }) {
        notifications.value.unshift({
            id: `n-${Date.now()}`,
            title,
            message,
            type,      // 'info' | 'success' | 'warning' | 'error'
            link,
            read: false,
            createdAt: new Date().toISOString(),
        })
        // Keep only last 30
        if (notifications.value.length > 30) notifications.value = notifications.value.slice(0, 30)
        save()
    }

    function markRead(id) {
        const n = notifications.value.find(n => n.id === id)
        if (n) { n.read = true; save() }
    }

    function markAllRead() {
        notifications.value.forEach(n => (n.read = true))
        save()
    }

    function remove(id) {
        notifications.value = notifications.value.filter(n => n.id !== id)
        save()
    }

    const unreadCount = ref(() => notifications.value.filter(n => !n.read).length)

    return { notifications, addNotification, markRead, markAllRead, remove, unreadCount }
})
