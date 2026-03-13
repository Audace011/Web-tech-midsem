import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LS_KEYS } from '@/helpers/constants'

const SEED_MESSAGES = [
    {
        id: 'msg-1',
        senderId: 'u-1',
        senderName: 'Alice Martin',
        receiverId: 'u-2',
        receiverName: 'Bob Johnson',
        itemId: 'item-2',
        itemTitle: 'Brown Leather Wallet',
        text: 'Hi Bob! I think that wallet might be mine. It has a Visa card ending in 4242.',
        timestamp: '2024-06-12T11:00:00Z',
        read: true,
    },
    {
        id: 'msg-2',
        senderId: 'u-2',
        senderName: 'Bob Johnson',
        receiverId: 'u-1',
        receiverName: 'Alice Martin',
        itemId: 'item-2',
        itemTitle: 'Brown Leather Wallet',
        text: "Yes that matches! Let's meet at the Times Square exit tomorrow at 9am.",
        timestamp: '2024-06-12T11:30:00Z',
        read: false,
    },
]

function loadMessages() {
    try {
        const raw = localStorage.getItem(LS_KEYS.MESSAGES)
        return raw ? JSON.parse(raw) : SEED_MESSAGES
    } catch { return SEED_MESSAGES }
}
function saveMessages(msgs) {
    localStorage.setItem(LS_KEYS.MESSAGES, JSON.stringify(msgs))
}

function loadBlocked() {
    try {
        const raw = localStorage.getItem('laf_blocked_threads')
        return raw ? JSON.parse(raw) : []
    } catch { return [] }
}
function saveBlocked(blocked) {
    localStorage.setItem('laf_blocked_threads', JSON.stringify(blocked))
}

export const useMessagesStore = defineStore('messages', () => {
    const messages = ref(loadMessages())
    const blockedThreads = ref(loadBlocked())

    /** Get all conversations for a user (grouped by other party + item) */
    function getConversations(userId) {
        const convMap = {}
        messages.value
            .filter(m => m.senderId === userId || m.receiverId === userId)
            .forEach(m => {
                const otherId = m.senderId === userId ? m.receiverId : m.senderId
                const otherName = m.senderId === userId ? m.receiverName : m.senderName
                const key = `${[userId, otherId].sort().join('-')}_${m.itemId}`
                if (!convMap[key]) {
                    convMap[key] = {
                        key,
                        otherId,
                        otherName,
                        itemId: m.itemId,
                        itemTitle: m.itemTitle,
                        messages: [],
                        unread: 0,
                    }
                }
                convMap[key].messages.push(m)
                if (!m.read && m.receiverId === userId) convMap[key].unread++
            })

        return Object.values(convMap)
            .map(c => ({
                ...c,
                lastMessage: c.messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0],
            }))
            .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp))
    }

    function getThread(userId, otherId, itemId) {
        return messages.value
            .filter(m =>
                m.itemId === itemId &&
                ((m.senderId === userId && m.receiverId === otherId) ||
                    (m.senderId === otherId && m.receiverId === userId))
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    }

    function sendMessage({ senderId, senderName, receiverId, receiverName, itemId, itemTitle, text }) {
        const msg = {
            id: `msg-${Date.now()}`,
            senderId, senderName,
            receiverId, receiverName,
            itemId, itemTitle,
            text,
            timestamp: new Date().toISOString(),
            read: false,
        }
        messages.value.push(msg)
        saveMessages(messages.value)
        return msg
    }

    function markThreadRead(userId, otherId, itemId) {
        messages.value = messages.value.map(m => {
            if (
                m.itemId === itemId &&
                m.receiverId === userId &&
                m.senderId === otherId
            ) {
                return { ...m, read: true }
            }
            return m
        })
        saveMessages(messages.value)
    }

    const unreadCount = computed(() => (userId) =>
        messages.value.filter(m => m.receiverId === userId && !m.read).length
    )

    function blockThread(key) {
        if (!blockedThreads.value.includes(key)) {
            blockedThreads.value.push(key)
            saveBlocked(blockedThreads.value)
        }
    }

    function unblockThread(key) {
        blockedThreads.value = blockedThreads.value.filter(k => k !== key)
        saveBlocked(blockedThreads.value)
    }

    return {
        messages, blockedThreads,
        getConversations, getThread,
        sendMessage, markThreadRead,
        unreadCount, blockThread, unblockThread,
    }
})
