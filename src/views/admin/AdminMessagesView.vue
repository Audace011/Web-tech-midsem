<template>
  <AppLayout>
    <div class="container admin-wrap">
      <div class="admin-header">
        <h1><MessageSquare :size="22" /> All Conversations</h1>
        <RouterLink to="/admin" class="back-link">← Dashboard</RouterLink>
      </div>
      
      <div v-if="allConversations.length === 0" class="empty-state">
        <MessageSquare :size="48" style="color:var(--color-text-4)" />
        <h3>No conversations yet</h3>
        <p>User conversations will appear here.</p>
      </div>
      
      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Users</th>
              <th>Item</th>
              <th>Last Message</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in allConversations" :key="c.key">
              <td>
                <div style="font-weight:600">{{ c.user1Name }}</div>
                <div class="text-muted" style="font-size:12px">vs. {{ c.user2Name }}</div>
              </td>
              <td>
                <RouterLink :to="`/items/${c.itemId}`" class="item-link">📦 {{ c.itemTitle }}</RouterLink>
                <div v-if="c.isResolved" class="status-warn">(Resolved)</div>
              </td>
              <td>
                <div class="text-preview">"{{ c.lastMessage.text }}"</div>
                <div class="text-muted" style="font-size:12px">{{ formatRelative(c.lastMessage.timestamp) }}</div>
              </td>
              <td>
                <BaseBadge :variant="c.isBlocked ? 'danger' : 'success'">
                  {{ c.isBlocked ? 'Restricted' : 'Active' }}
                </BaseBadge>
              </td>
              <td>
                <BaseButton variant="outline" size="sm" @click="$router.push(`/inbox/${c.key}`)">
                  View Chat
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { MessageSquare } from 'lucide-vue-next'
import AppLayout  from '@/components/layout/AppLayout.vue'
import BaseBadge  from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useMessagesStore } from '@/stores/messages'
import { useItemsStore }    from '@/stores/items'
import { formatRelative }  from '@/helpers/formatDate'

const store = useMessagesStore()
const itemsStore = useItemsStore()

// We need to build a list of ALL conversations across all users
const allConversations = computed(() => {
  const convMap = {}
  
  store.messages.forEach(m => {
    // Generate a consistent key regardless of who sent first
    const [idA, idB] = [m.senderId, m.receiverId].sort()
    const key = `${idA}-${idB}_${m.itemId}`
    
    if (!convMap[key]) {
      convMap[key] = {
        key,
        user1Id: idA,
        user1Name: m.senderId === idA ? m.senderName : m.receiverName,
        user2Id: idB,
        user2Name: m.senderId === idB ? m.senderName : m.receiverName,
        itemId: m.itemId,
        itemTitle: m.itemTitle,
        messages: [],
      }
    }
    convMap[key].messages.push(m)
  })
  
  return Object.values(convMap)
    .map(c => {
      const item = itemsStore.getItemById(c.itemId)
      return {
        ...c,
        lastMessage: c.messages.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0],
        isResolved: item?.status === 'resolved',
        isBlocked: store.blockedThreads.includes(c.key)
      }
    })
    .sort((a,b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp))
})
</script>

<style scoped>
.admin-wrap { padding:var(--space-10) var(--space-4) var(--space-16); }
.admin-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-6); }
.admin-header h1 { display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-2xl);font-weight:var(--weight-extrabold); }
.back-link { font-size:var(--text-sm);color:var(--color-text-2); }

.admin-table-wrap { overflow-x:auto;border-radius:var(--radius-lg);border:1px solid var(--color-border); }
.admin-table { width:100%;border-collapse:collapse;font-size:var(--text-sm); }
.admin-table th { background:var(--color-bg-2);padding:var(--space-3) var(--space-4);text-align:left;font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.06em;color:var(--color-text-3);border-bottom:1px solid var(--color-border); }
.admin-table td { padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--color-border);vertical-align:middle; }
.admin-table tr:last-child td { border-bottom:none; }
.admin-table tr:hover td { background:var(--color-surface); }

.text-preview { max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-text-2); font-style: italic; }
.item-link { color: var(--color-primary); font-weight: 500; text-decoration: none; }
.item-link:hover { text-decoration: underline; }
.status-warn { font-size: 11px; color: var(--color-danger); font-weight: 600; margin-top: 2px; }
.text-muted { color:var(--color-text-3); }
.empty-state { display:flex; flex-direction:column; align-items:center; gap:var(--space-4); padding:var(--space-16) 0; }
</style>
