import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LS_KEYS } from '@/helpers/constants'

// No seed data — items are created entirely by users
const SEED_ITEMS = []

function loadItems() {
    try {
        const raw = localStorage.getItem(LS_KEYS.ITEMS)
        return raw ? JSON.parse(raw) : SEED_ITEMS
    } catch { return SEED_ITEMS }
}

function saveItems(items) {
    localStorage.setItem(LS_KEYS.ITEMS, JSON.stringify(items))
}

export const useItemsStore = defineStore('items', () => {
    const items = ref(loadItems())
    const searchQuery = ref('')
    const filters = ref({
        type: '',       // 'lost' | 'found' | ''
        category: '',
        status: '',
        dateFrom: '',
        dateTo: '',
    })

    const filteredItems = computed(() => {
        let result = items.value.filter(i => i.approved && i.status !== 'resolved')

        if (searchQuery.value.trim()) {
            const q = searchQuery.value.toLowerCase()
            result = result.filter(i =>
                i.title.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q) ||
                i.location.toLowerCase().includes(q)
            )
        }
        if (filters.value.type) result = result.filter(i => i.type === filters.value.type)
        if (filters.value.category) result = result.filter(i => i.category === filters.value.category)
        if (filters.value.status) result = result.filter(i => i.status === filters.value.status)
        if (filters.value.dateFrom) result = result.filter(i => i.dateLostFound >= filters.value.dateFrom)
        if (filters.value.dateTo) result = result.filter(i => i.dateLostFound <= filters.value.dateTo)

        return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })

    const allItemsForAdmin = computed(() =>
        [...items.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    )

    function getItemById(id) {
        return items.value.find(i => i.id === id) || null
    }

    function getUserItems(userId) {
        return items.value
            .filter(i => i.userId === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    async function postItem(data, user) {
        const newItem = {
            id: `item-${Date.now()}`,
            ...data,
            userId: user.id,
            userName: user.name,
            createdAt: new Date().toISOString(),
            approved: user.role === 'admin' ? true : false, // admin auto-approved
            status: 'open',
        }
        // In a real app non-admin items would need approval.
        // For demo purposes, auto-approve all:
        newItem.approved = true
        items.value.unshift(newItem)
        saveItems(items.value)
        return newItem
    }

    async function editItem(id, data) {
        const idx = items.value.findIndex(i => i.id === id)
        if (idx === -1) throw new Error('Item not found.')
        // Full replacement — ensures Vue 3 reactivity triggers correctly
        items.value = items.value.map(i => i.id === id ? { ...i, ...data } : i)
        saveItems(items.value)
        return items.value.find(i => i.id === id)
    }

    async function deleteItem(id) {
        items.value = items.value.filter(i => i.id !== id)
        saveItems(items.value)
    }

    async function markResolved(id) {
        items.value = items.value.map(i =>
            i.id === id ? { ...i, status: i.status === 'resolved' ? 'open' : 'resolved' } : i
        )
        saveItems(items.value)
    }

    async function approveItem(id) {
        items.value = items.value.map(i => i.id === id ? { ...i, approved: true } : i)
        saveItems(items.value)
    }

    async function rejectItem(id) {
        items.value = items.value.map(i => i.id === id ? { ...i, approved: false } : i)
        saveItems(items.value)
    }

    function setSearch(q) { searchQuery.value = q }
    function setFilter(key, value) { filters.value[key] = value }
    function resetFilters() {
        searchQuery.value = ''
        filters.value = { type: '', category: '', status: '', dateFrom: '', dateTo: '' }
    }

    const stats = computed(() => ({
        total: items.value.length,
        lost: items.value.filter(i => i.type === 'lost' && i.status !== 'resolved').length,
        found: items.value.filter(i => i.type === 'found' && i.status !== 'resolved').length,
        resolved: items.value.filter(i => i.status === 'resolved').length,
        pending: items.value.filter(i => !i.approved).length,
    }))

    return {
        items, searchQuery, filters,
        filteredItems, allItemsForAdmin, stats,
        getItemById, getUserItems,
        postItem, editItem, deleteItem, markResolved,
        approveItem, rejectItem,
        setSearch, setFilter, resetFilters,
    }
})
