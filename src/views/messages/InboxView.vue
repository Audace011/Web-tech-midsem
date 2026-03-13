<template>
  <AppLayout>
    <div class="container inbox-wrap">
      <h1 class="page-title"><MessageSquare :size="22" /> Inbox</h1>
      <div v-if="conversations.length === 0" class="inbox-empty">
        <MessageSquare :size="48" />
        <h3>No messages yet</h3>
        <p>Contact the owner of an item to start a conversation.</p>
      </div>
      <div v-else class="convo-list">
        <RouterLink
          v-for="c in conversations"
          :key="c.key"
          :to="`/inbox/${c.key}`"
          class="convo-item"
          :class="{ 'convo-item--unread': c.unread > 0 }"
        >
          <div class="convo-avatar">{{ c.otherName[0] }}</div>
          <div class="convo-info">
            <div class="convo-header">
              <span class="convo-name">{{ c.otherName }}</span>
              <span class="convo-time">{{ formatRelative(c.lastMessage.timestamp) }}</span>
            </div>
            <p class="convo-item-title">
              📦 {{ c.itemTitle }}
              <span v-if="c.isResolved" class="convo-warn"> (Resolved)</span>
              <span v-else-if="c.isBlocked" class="convo-warn"> (Restricted)</span>
            </p>
            <p class="convo-preview" :class="{ 'convo-preview--disabled': c.isResolved || c.isBlocked }">
              {{ c.lastMessage.text }}
            </p>
          </div>
          <span v-if="c.unread > 0" class="convo-unread">{{ c.unread }}</span>
        </RouterLink>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed } from 'vue'
import { MessageSquare } from 'lucide-vue-next'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useMessagesStore } from '@/stores/messages'
import { useItemsStore }    from '@/stores/items'
import { useAuthStore }     from '@/stores/auth'
import { formatRelative }   from '@/helpers/formatDate'

const auth  = useAuthStore()
const store = useMessagesStore()
const itemsStore = useItemsStore()

const conversations = computed(() => store.getConversations(auth.user.id)
  .map(c => {
    // Only care about messages sent TO the user
    const receivedMsgs = c.messages.filter(m => m.receiverId === auth.user.id)
    if (receivedMsgs.length === 0) return null

    // Get the most recent received message for the preview
    const lastRecMsg = receivedMsgs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
    
    const item = itemsStore.getItemById(c.itemId)
    return {
      ...c,
      lastMessage: lastRecMsg,
      isResolved: item?.status === 'resolved',
      isBlocked: store.blockedThreads.includes(c.key)
    }
  })
  .filter(Boolean)
  .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp))
)
</script>

<style scoped>
.inbox-wrap  { max-width:700px;margin:0 auto;padding:var(--space-10) var(--space-4) var(--space-16); }
.page-title  { display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-2xl);font-weight:var(--weight-extrabold);margin-bottom:var(--space-6); }
.inbox-empty { display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-16) 0;text-align:center;color:var(--color-text-3); }
.inbox-empty h3 { font-size:var(--text-xl);color:var(--color-text-2); }

.convo-list { display:flex;flex-direction:column;gap:var(--space-2); }
.convo-item {
  display:flex;align-items:center;gap:var(--space-4);
  padding:var(--space-4);border-radius:var(--radius-lg);
  background:var(--color-bg-2);border:1px solid var(--color-border);
  text-decoration:none;color:inherit;transition:all var(--transition-base);position:relative;
}
.convo-item:hover { border-color:var(--color-primary);background:var(--color-surface); }
.convo-item--unread { border-color:rgba(108,99,255,0.4);background:var(--color-primary-alpha); }

.convo-avatar { width:44px;height:44px;border-radius:var(--radius-full);background:var(--gradient-brand);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:var(--weight-bold);font-size:var(--text-lg);flex-shrink:0; }
.convo-info { flex:1;min-width:0; }
.convo-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:2px; }
.convo-name   { font-weight:var(--weight-semibold);font-size:var(--text-base); }
.convo-time   { font-size:var(--text-xs);color:var(--color-text-3); }
.convo-item-title { font-size:var(--text-xs);color:var(--color-primary-light);margin-bottom:2px; }
.convo-warn { color:var(--color-danger);font-weight:var(--weight-semibold); }
.convo-preview { font-size:var(--text-sm);color:var(--color-text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.convo-preview--disabled { color:var(--color-text-4);font-style:italic; }

.convo-unread { background:var(--color-primary);color:#fff;border-radius:var(--radius-full);min-width:20px;height:20px;padding:0 6px;font-size:var(--text-xs);font-weight:var(--weight-bold);display:flex;align-items:center;justify-content:center; }
</style>
